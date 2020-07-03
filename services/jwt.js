'use strict'
var jwt = require('jwt-simple');
var moment = require('moment');
var key = 'user';

exports.createToken = (user) => {
    var payload = {
        sub: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        iat: moment().unix(),
        exp: moment().add(15, "days").unix()
    };
    return jwt.encode(payload, key);
}