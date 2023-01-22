const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true,
    },
    groupDescription: {
        type: String,
    },
    latLong : {
        type: Array,
    },
    exactLocation: {
        type: String,
    },
    members: {
        type: Number,
    },
    date: {
        type: Date,
        default: new Date,
    },
})

const Groups = mongoose.model('Groups', groupSchema);

module.exports = Groups