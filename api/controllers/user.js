'user strict'

var User = require('../models/user');


function home(req, res) {
    res.status(200).send({
        message : 'Hola mundo desde el servidor de nodejs'
    });
}

function pruebas(req, res) {
    res.status(200).send({
        message : 'Accion de pruebas en el servidor de node-js'
    });
}

module.exports = {
    home,
    pruebas
}