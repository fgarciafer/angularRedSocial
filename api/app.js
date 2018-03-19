'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// cargar rutas
var userRoutes = require('./routes/user');
var followRoutes = require('./routes/follow');

// cargar midlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// cors

// rutas
app.use('/api',userRoutes);
app.use('/api',followRoutes);

// exportar

module.exports = app;

