const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true,
    },
    groupDescription: {
        type: String,
        required: true,
    },
    social: {
        type: String,
        required: true,
    },
    latLong : {
        type: Array,
        required: true,
    },
    exactLocation: {
        type: String,
        required: true,
    },
    members: {
        type: Array,
        required: true,
    },
    groupCode: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: new Date,
    },
})

const Groups = mongoose.model('Groups', groupSchema);

module.exports = Groups