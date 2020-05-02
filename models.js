var mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    passwordHash: {
        type: String,
    }
}, {
    versionKey: false
});

module.exports = mongoose.model('User', userSchema);