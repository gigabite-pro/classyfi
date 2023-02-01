const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const {isAuthorized} = require('./config/authCheck');
const authRoute = require('./routes/auth');
const groupsRoute = require('./routes/groups');
const Groups = require('./models/Groups');
const Users = require('./models/Users');
require('dotenv').config();

app.use(express.static(__dirname + '/public'));
app.set('views', (__dirname + '/views'))
app.set('view engine', 'ejs');
app.use(
    session({
        secret : 'yoyohoneysingh',
        cookie : {
            maxAge : 60000 * 60 * 24
        },
        saveUninitialized : true,
        resave : false
    })
)
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//db connection
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI,{ 
    useNewUrlParser: true, 
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err))


//routes
app.use('/auth', authRoute);
app.use('/groups', groupsRoute);

app.get('/', (req, res)=>{
    if(req.session.user){
        res.redirect('/map')
    }else{
        res.render('index');
    }
})

app.get('/map', isAuthorized, (req, res)=>{
    Groups.find({}).sort({members: 'desc'})
    .then((groups) => {
        res.render('map', {groups});
    })
    .catch(err => console.log(err))
})

app.get('/profile', isAuthorized, (req,res) =>{
    Users.find({}).sort({points: 'desc'}).limit(50)
    .then(users => {
        Users.findById(req.session.user._id)
        .then(user => {
            res.render('profile', {user, users});
        })
        .catch(err => console.log(err))
    }).catch(err => console.log(err))
})

const PORT = process.env.PORT || 3000; // || = OR, && = AND

app.listen(PORT, ()=>{
    console.log(`Server is running on the port ${PORT}`);
})