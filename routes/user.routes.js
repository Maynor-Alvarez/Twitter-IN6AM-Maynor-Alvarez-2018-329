'use strict'

var express = require('express');
var controller = require('../controllers/controller');
var api = express.Router();
var {ensureAuth} = require('../middlewares/authenticated');


api.post('',ensureAuth, controller.commands);

module.exports = api;