'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const key = 'userpasss';

exports.ensureAuth = (req, res, next) => {
    let params = req.body;
    let arrUserData = Object.values(params);
    let resp = arrUserData.toString().split(" ");

    if (!req.headers.authorization) {
        if (resp[0] === 'register') {
            next();
        } else if (resp[0] === 'login') {
            next();
        } else {
            return res.status(500).send({ message: 'Debes loguearte para acceder a ' + resp[0] });
        }
    } else {
        var token = req.headers.authorization.replace(/["']+/g, '');
        try {
            var payLoad = jwt.decode(token, key, true);
            console.log(payLoad);
            var idUser = payLoad.sub;
            module.exports.idUser = idUser;
            if (payLoad.exp <= moment().unix()) {
                return res.status(401).send({ message: 'Token expirado.' });
            }
        } catch (ex) {
            return res.status(404).send({ message: 'Token no válido.' });
        }
        req.user = payLoad;
        next();
    }
}