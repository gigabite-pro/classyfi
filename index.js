const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const authRoute = require('./routes/auth');
const groupsRoute = require('./routes/groups');
const Groups = require('./models/Groups');
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
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//db connection
mongoose.connect(process.env.MONGO_URI,{ 
    useNewUrlParser: true, 
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err))
mongoose.set('strictQuery', true);


//routes
app.use('/auth', authRoute);
app.use('/groups', groupsRoute);

app.get('/', (req, res)=>{
    res.render('index');
})

app.get('/dashboard', (req, res)=>{
    Groups.find({})
    .then((groups) => {
        res.render('dashboard', {groups});
    })
    .catch(err => console.log(err))
})

const PORT = process.env.PORT || 3000; // || = OR, && = AND

app.listen(PORT, ()=>{
    console.log(`Server is running on the port ${PORT}`);
})