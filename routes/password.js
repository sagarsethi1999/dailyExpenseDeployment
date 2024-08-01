const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/user');
const ForgotPasswordRequest = require('../models/ForgotPasswordRequest');

router.post('/forgotpassword', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        console.log('user for email', user);

        if (user) {
            const id = uuid.v4();
            const newForgotPasswordRequest = new ForgotPasswordRequest({
                id,
                userId: user._id,
                active: true
            });
            await newForgotPasswordRequest.save();

            const defaultClient = SibApiV3Sdk.ApiClient.instance;
            const apiKey = defaultClient.authentications['api-key'];
            apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

           

            console.log("Using API Key:", apiKey.apiKey);

            const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
            sendSmtpEmail.sender = { email: 'sagar@gmail.com' };
            sendSmtpEmail.to = [{ email }];
            sendSmtpEmail.subject = 'Password Reset Request';
            sendSmtpEmail.htmlContent = `<a href="http://localhost:3000/password/resetpassword/${id}">Reset Password</a>`;


            try {
                await apiInstance.sendTransacEmail(sendSmtpEmail);
                console.log('Reminder email sent successfully');
            } catch (error) {
                console.error('Error sending reminder email:', error);
            }


            return res.status(200).json({ message: 'Link to reset password sent to your email', success: true });
        } else {
            throw new Error('User does not exist');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message, success: false });
    }
});

router.get('/resetpassword/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const forgotPasswordRequest = await ForgotPasswordRequest.findOne({ id, active: true });

        if (forgotPasswordRequest) {
            return res.status(200).send(`<html>
                                            <form action="/password/updatepassword/${id}" method="post">
                                                <label for="newpassword">Enter New password</label>
                                                <input name="newpassword" type="password" required></input>
                                                <button>Reset Password</button>
                                            </form>
                                        </html>`);
        } else {
            return res.status(400).send('Invalid or expired reset link');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message, success: false });
    }
});


router.post('/updatepassword/:resetpasswordid', async (req, res) => {
    try {
        const { newpassword } = req.body;
        const resetpasswordid = req.params.resetpasswordid;

        const forgotPasswordRequest = await ForgotPasswordRequest.findOne({ id: resetpasswordid, active: true });

        if (forgotPasswordRequest) {
            const user = await User.findById(forgotPasswordRequest.userId);

            if (user) {
                const saltRounds = 10;
                const hash = await bcrypt.hash(newpassword, saltRounds);

                user.password = hash;
                await user.save();

                forgotPasswordRequest.active = false;
                await forgotPasswordRequest.save();



                return res.status(200).send(`<html>
                                             <body>
                                                 <h1>Password Reset Successful</h1>
                                                 <p>Your password has been successfully updated.</p>
                                                 <a href="/login/login.html">Go to Login</a>
                                             </body>
                                             </html>`);
            } else {
                return res.status(404).json({ message: 'User not found', success: false });
            }
        } else {
            return res.status(400).json({ message: 'Invalid or expired reset link', success: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message, success: false });
    }
});


module.exports = router;

















