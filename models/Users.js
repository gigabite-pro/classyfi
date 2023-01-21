const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
    },
    email : {
        type: String,
        required: true,
    },
    currentRoom: {
        type: String,
    },
    pfp: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: new Date,
    },
})

const Users = mongoose.model('Users', userSchema);

module.exports = Users