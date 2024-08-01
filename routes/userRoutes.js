const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            console.log('User already exists with email:', email);
            return res.status(409).send('Email address is already in use');
        }

        const saltRounds = 10; 
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        console.log('User signed up:', newUser);

        res.status(200).send('User signed up successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).send('User not found');

        const validPassword = await user.validPassword(password);
        if (!validPassword) return res.status(401).send('Incorrect password');

        const token = jwt.sign({ id: user._id, name: user.name }, 'secretkey');

        res.status(200).json({ token: token, message: 'Login successful' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
