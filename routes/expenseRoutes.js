const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/auth');
const AWS = require('aws-sdk');
const DownloadedFile = require('../models/downloadedFile');
require('dotenv').config();

function uploadToS3(data, filename) {
  const BUCKET_NAME = 'expensetrackingappbysagar';
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

  let s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET
  });

  var params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: data,
    ACL: 'public-read'
  };

  return new Promise((resolve, reject) => {
    s3bucket.upload(params, (err, s3response) => {
      if (err) {
        console.log('something went wrong!!!', err);
        reject(err);
      } else {
        console.log('success', s3response);
        resolve(s3response.Location);
      }
    });
  });
}

router.get('/download', verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const expenses = await Expense.find({ userID: userId });
    const stringifiedExpenses = JSON.stringify(expenses);
    const filename = `Expense${userId}/${new Date().toISOString()}.txt`;
    const fileURL = await uploadToS3(stringifiedExpenses, filename);
    await new DownloadedFile({ userId: userId, fileURL: fileURL }).save();
    res.status(200).json({ fileURL, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/downloaded-files', verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const downloadedFiles = await DownloadedFile.find({ userId: userId }).select('fileURL createdAt');
    res.json(downloadedFiles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const { ExpenseAmount, Description, Category } = req.body;
  const userID = req.user.id;

  try {
    const newExpense = new Expense({ ExpenseAmount, Description, Category, userID });
    await newExpense.save();

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.totalExpense += parseInt(ExpenseAmount);
    await user.save();

    res.status(200).json({ message: 'Expense added successfully', newExpense });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const expenses = await Expense.find({ userID: userId })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    const count = await Expense.countDocuments({ userID: userId });
    const totalPages = Math.ceil(count / limit);

    res.json({
      expenses,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  const expenseId = req.params.id;
    const userId = req.user.id;
  try {
    const deletedExpense = await Expense.findOneAndDelete({ _id: expenseId, userID: userId });
    if (!deletedExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.totalExpense -= deletedExpense.ExpenseAmount;
    await user.save();

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  const expenseId = req.params.id;
  const userId = req.user.id;

  try {
    const expenseToUpdate = await Expense.findOne({ _id: expenseId, userID: userId });
    if (!expenseToUpdate) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const oldAmount = expenseToUpdate.ExpenseAmount;
    const newAmount = req.body.ExpenseAmount;
    const amountDifference = newAmount - oldAmount;

    await Expense.updateOne({ _id: expenseId, userID: userId }, req.body);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.totalExpense += amountDifference;
    await user.save();

    res.json({ message: 'Expense updated successfully' });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
