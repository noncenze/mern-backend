// IMPORTS
require('dotenv').config();
const {Strategy, ExtractJwt} = require('passport-jwt');


// MODELS
const {User} = require('../models');


// Object Made of Strategy
const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};


const JWT_STRATEGY = new Strategy(options, async (jwtPayload, done) => {
    // Check for a user user by ID
    try {
        console.log('JWT Payload', jwtPayload);
        const user = await User.findById(jwtPayload.id);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        };
    } catch (error) {
        console.log('----------- PASSPORT CONFIG ERROR -----------')
        console.log(error);
    };
});


// Export a function that will use Strategy
module.exports = async (passport) => {
    passport.use(JWT_STRATEGY);
};