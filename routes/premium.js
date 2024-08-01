const express = require('express');
const router = express.Router();
const User = require('../models/user');
const verifyToken = require('../middleware/auth');

router.get('/premium', verifyToken, async (req, res) => {
    const userId = req.user.id; 
    // console.log('this is user id for checking prime status: ', userId);
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json({ isPremium: user.premiumUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/premium/leaderboard', verifyToken, async (req, res) => {
    try {
        const leaderboardData = await User.find({}, 'name totalExpense')
            .sort({ totalExpense: -1 }); 
        res.json(leaderboardData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

