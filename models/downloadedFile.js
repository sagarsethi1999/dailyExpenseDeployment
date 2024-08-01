const mongoose = require('mongoose');

const downloadedFileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    fileURL: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    }
});

const DownloadedFile = mongoose.model('DownloadedFile', downloadedFileSchema);

module.exports = DownloadedFile;


