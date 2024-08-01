const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    ExpenseAmount: {
        type: Number,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    Category: {
        type: String,
        required: true
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
