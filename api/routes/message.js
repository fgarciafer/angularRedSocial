'use strict'

var express = require('express');
var MessageController = require('../controllers/message');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/message',md_auth.ensureAuth,MessageController.saveMessage);
api.get('/my-messages/:page?',md_auth.ensureAuth,MessageController.getReceivesMessages);
api.get('/messages/:page?',md_auth.ensureAuth,MessageController.getEmitMessages);
api.get('/unviewed-messages',md_auth.ensureAuth,MessageController.getUnViewedMessages);
api.get('/set-viewed-messages',md_auth.ensureAuth,MessageController.setViewedMessages);

module.exports = api;