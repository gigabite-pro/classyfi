const router = require('express').Router();
const {isAuthorized} = require('../config/authCheck');
const {Client} = require("@googlemaps/google-maps-services-js");
const Groups = require('../models/Groups');
require('dotenv').config()

const client = new Client({});

router.get('/all', (req, res) => {
    Groups.find({})
    .then((groups) => {
        res.json({groups});
    })
    .catch(err => console.log(err))
})

router.post('/create', (req, res) => {
    const {groupName, groupDescription, address, innerLocation} = req.body;

    client.geocode({
        params:{
            address: address,
            key: process.env.GOOGLE_MAPS_API_KEY
        }
    }).then(resp => {
        console.log(resp.data.results[0].geometry.location);
        const latLng = [resp.data.results[0].geometry.location.lat, resp.data.results[0].geometry.location.lng];

        const newGroup = new Groups({
            groupName,
            groupDescription,
            latLong: latLng,
            innerLocation,
            members: 1,
        })
        newGroup.save()
        .then((group) => {
            res.redirect('/dashboard');
        })
        .catch(err => console.log(err))
    }).catch(err => console.log(err))
})

module.exports = router;