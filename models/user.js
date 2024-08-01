const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    premiumUser: {
        type: Boolean,
        default: false
    },
    totalExpense: {
        type: Number,
        default: 0
    }
});


userSchema.virtual('expenses', {
    ref: 'Expense',
    localField: '_id',
    foreignField: 'userID'
});

userSchema.virtual('orders', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'userId'
});

userSchema.virtual('forgotPasswordRequests', {
    ref: 'ForgotPassword',
    localField: '_id',
    foreignField: 'userId'
});

userSchema.methods.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
