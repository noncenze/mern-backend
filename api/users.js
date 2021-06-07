// Imports
require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const JWT_SECRET = process.env.JWT_SECRET;


// MODELS
const {User} = require('../models');


// CONTROLLERS
const test = async (req, res) => {
    res.json({ message: 'User endpoint OK!'});
}

const signup = async (req, res) => {
    console.log(`----- INSIDE OF SIGNUP -----`);
    console.log('req.body => ', req.body);
    const {name, email, password} = req.body;
    try {
        // See if a user exist in the database by email
        const user = await User.findOne({email});
        
        //If a user exist, return a 400 error and message
        if (user) {
            return res.status(400).json({ message: 'Email already exist'});
        } else {
            console.log('Create a new user');
            let saltRounds = 12;
            let salt = await bcrypt.genSalt(saltRounds);
            let hash = await bcrypt.hash(password, salt);

            const newUser = new User({
                name: name,
                email: email,
                password: hash
            });

            const savedNewUser = await newUser.save();
            res.json(savedNewUser);
        };
    } catch (error) {
        console.log('---------- USERS SIGNUP ERROR ----------')
        console.log(error);
        return res.status(400).json({message: `Error occurred. Please try again...`});
    }
}


const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        // Find a user via email
        const user = await User.findOne({email});
        console.log(user);
        if (!user) {
            // A user is not found in the database
            return res.status(400).json({ message: 'Either email or password is incorrect.'});
        } else {
            // A User is found in the database
            let isMatch = await bcrypt.compare(password, user.password);
            console.log('Password correct: ', isMatch);
            if (isMatch) {
                // Add one to timesLoggedIn since the default is 0
                let logs = user.timesLoggedIn + 1;
                user.timesLoggedIn = logs;
                const savedUser = await user.save();
                // Create a token payload (object of data that includes the user information)
                const payload = {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    expiredToken: Date.now()
                }
                try {
                    // Generate token
                    let token = await jwt.sign(payload, JWT_SECRET, {expiresIn: 3600});
                    console.log('---------- TOKEN ----------')
                    console.log(token);
                    let legit = await jwt.verify(token, JWT_SECRET, {expiresIn: 60});
                    res.json({
                        success: true,
                        token: `Bearer ${token}`,
                        userData: legit
                    });
                } catch (error) {
                    console.log('---------- USERS ISMATCH ERROR ----------');
                    console.log(error);
                    return res.status(400).json({ message: 'Session has ended. Please log in again.'});
                };
            } else {
                return res.status(400).json({ message: 'Either email or password is incorrect.'});
            };
        };
    } catch (error) {
        console.log('---------- USERS LOGIN ERROR ----------')
        console.log(error);
        return res.status(400).json({ message: 'Either email or password is incorrect. Please try again.'});
    };
};


// GET Routes
router.get('/test', test);


// POST ROUTE - api/users/signup (Public)
router.post('/signup', signup);


// POST ROUTE - api/users/login (Public)
router.post('/login', login);


// GET api/users/current (Private)
// router.get('/profile', passport.authenticate('jwt', { session: false }), profile);
// router.get('/all-users', fetchUsers);


module.exports = router; 