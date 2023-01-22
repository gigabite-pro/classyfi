const router = require('express').Router();
const {isAuthorized} = require('../config/authCheck');
const {Client} = require("@googlemaps/google-maps-services-js");
const Groups = require('../models/Groups');
const shortid = require('shortid');
const Users = require('../models/Users');
const moment = require('moment');
require('dotenv').config()

console.log(moment().format());
const client = new Client({});

router.get('/all', isAuthorized, (req, res) => {
    Groups.find({})
    .then((groups) => {
        res.json({groups});
    })
    .catch(err => console.log(err))
})

router.post('/create', isAuthorized, (req, res) => {
    const {groupName, groupDescription, social, address, exactLocation} = req.body;

    client.geocode({
        params:{
            address: address,
            key: process.env.GOOGLE_MAPS_API_KEY
        }
    }).then(resp => {
        const latLng = [resp.data.results[0].geometry.location.lat, resp.data.results[0].geometry.location.lng];

        const newGroup = new Groups({
            groupName,
            groupDescription,
            social,
            latLong: latLng,
            exactLocation,
            members: [req.session.user._id],
            groupCode: shortid.generate(),
        })
        newGroup.save()
        .then((group) => {
            Users.findById(req.session.user._id)
            .then(user => {
                user.currentGroup = {
                    groupName: group.groupName,
                    groupCode: group.groupCode,
                    joinTime: moment().format(),
                };
                user.status = 'admin'
                user.save()
                .then(() => {
                    res.redirect('/profile');
                })
            })
            .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
    }).catch(err => console.log(err))
})

router.get('/check', isAuthorized, (req, res) => {
    const code = req.query.code;
    Groups.findOne({groupCode: code})
    .then(group => {
        if(group){
            res.json({
                status: "success",
            });
        } else {
            res.json({
                status: "failed",
            });
        }
    })
    .catch(err => console.log(err))
})

router.post('/join', isAuthorized, (req, res) => {
    const {groupCode} = req.body;
    Groups.findOne({groupCode: groupCode})
    .then((group) => {
        if(group){
            members = group.members;
            members.push(req.session.user._id);
            group.markModified('members');
            group.save()
            .then(() => {
                Users.findById(req.session.user._id)
                .then(user => {
                    user.currentGroup = {
                        groupName: group.groupName,
                        groupCode: group.groupCode,
                        joinTime: moment().format(),
                    };
                    user.status = 'member'
                    user.save()
                    .then(() => {
                        res.redirect('/profile');
                    })
                })
                .catch(err => console.log(err))
            })
            .catch(err => console.log(err))
        }
    })
    .catch(err => console.log(err))
})

router.post('/delete', isAuthorized, (req, res) => {
    const {groupCode} = req.body;
    Groups.findOneAndDelete({groupCode : groupCode})
    .then(doc => {
        Users.find({_id: doc.members})
        .then(users => {
            users.forEach(user => {
                increment = (Math.floor(moment().diff(user.currentGroup.joinTime, 'minutes') / 30)) * 5;
                user.points = user.points + increment;
                user.currentGroup = {};
                user.status = '';
                user.save()
                .then(() => {
                    res.redirect('/profile');
                })
                .catch(err => console.log(err))
            })
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})

router.post('/leave', isAuthorized, (req, res) => {
    const {groupCode} = req.body;
    Groups.findOne({groupCode: groupCode})
    .then(group => {
        members = group.members;
        group.members = members.filter(member => member != req.session.user._id);
        group.markModified('members');
        group.save()
        .then(() => {
            Users.findById(req.session.user._id)
            .then(user => {
                increment = (Math.floor(moment().diff(user.currentGroup.joinTime, 'minutes') / 30)) * 5;
                user.points = user.points + increment;
                user.currentGroup = {};
                user.status = '';
                user.save()
                .then(() => {
                    res.redirect('/profile');
                })
            })
            .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
    })
})

module.exports = router;