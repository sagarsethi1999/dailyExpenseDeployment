const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const forgotPasswordSchema = new mongoose.Schema({
    id: {
        type: String,
        default: uuidv4,
        unique: true,
        required: true
    },
    active: {
        type: Boolean,
        required: true
    },
    expiresby: {
        type: Date,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        onDelete: 'CASCADE'
    }
});

const ForgotPassword = mongoose.model('ForgotPassword', forgotPasswordSchema);

module.exports = ForgotPassword;

