// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Route to handle user sign-up
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            console.log('User already exists with email:', email);
            return res.status(409).send('Email address is already in use');
        }

        // Create new user
        const newUser = await User.create({ name, email, password });
        console.log('User signed up:', newUser);

        // Send success response
        res.status(200).send('User signed up successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
});




router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if password matches
        if (user.password !== password) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Password matches, login successful
        return res.status(200).json({ message: 'User login successful' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
