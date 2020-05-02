require('dotenv').config();

var express = require("express");
var app = express();
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

//Bring in model
var User = require('./models');

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to database'));

//is a method inbuilt in express to recognize the incoming Request Object as a JSON Object. This method is called as a middleware in your application using the code:
app.use(express.json());
//is a method inbuilt in express to recognize the incoming Request Object as strings or arrays. This method is called as a middleware in your application using the code:
app.use(express.urlencoded({ extended: false }));

app.post('/signup', function(req, res, next) {
    User.findOne({
        email: req.body.email
    }, async function(err, user) {
        //Als er een error is
        if (err) return next (err);
        //Als de user al bestaat
        if (user) return res.send({'result': 'USERALREADYEXISTS'});
        //anders maakt hij een nieuwe user aan
        let newUser = new User({
            email: req.body.email,
            passwordHash: await bcrypt.hash(req.body.password, 10)
        });
        newUser.save(function(err) {
            if (err) return next (err);
            res.send({'result': 'SIGNUPSUCCESS'});
        });
    });
});

app.post('/login', async (req, res, next) => {
    User.findOne({
        email: req.body.email
    }, async function(err, user) {
        if (err) return next(err);
        if (!user || !await bcrypt.compare(req.body.password, user.passwordHash)) {
            return res.send({'result': 'Email or password incorrect'});
        };
        //Create and assign token
        const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
        res.header('header-token', token);

        res.send({'result': 'LOGINSUCCESS'});
    });
});

app.get('/get', verifyToken,(req, res, next) => {
    res.send('API WORKS!')
});

function verifyToken(req, res, next) {
    const token = req.header('header-token');
    if (!token) return res.send({'result': 'Denied'});
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        next();
    } catch {
        res.send({'result': 'Invalid token'});
    };
};

app.listen(3000, () => {
 console.log("Server running on port 3000");
});