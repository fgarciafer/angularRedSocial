'user strict'

var bcrypt = require('bcrypt-nodejs');

var User = require('../models/user');
var jwt = require('../services/jwt');

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

function saveUser(req, res){
    var params = req.body;
    var user = new User();

    if(params.name && params.surname && params.nick && params.email && params.password){
        user.name = params.name;
        user.surname = params.surname;
        user.email = params.email;
        user.nick = params.nick;
        user.role = 'ROLE_USER';
        user.image = null;

        // Comprobar usuarios duplicados
        User.find({ $or: [
            {email: user.email.toLowerCase()},
            {nick: user.nick.toLowerCase()}
        ]}).exec((err, users) => {
            if(err) return res.status(500).send({message:'Error en la peticion de usuarios'});

            if(users && users.length >=1){
                return res.status(200).send({message: 'El usuario que intenta registrar ya existe'});
            } else {
                // Cifra la contraseña
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;

                    user.save((err, userStored) => {
                        if(err) return res.status(500).send({message : 'Error al guardar el usuario'});
                        
                        // Guardamos los datos
                        if(userStored){
                            res.status(200).send({user: userStored});
                        } else{
                            res.status(404).send({message : 'No se ha registrado el usuario'})
                        }
                    });
                });                
            }
        })



    } else {
        res.status(200).send({
            message : 'Rellena todos los campos necesarios'
        });
    }
}

function loginUser (req, res){
    var params = req.body;
    var email = params.email;
    var password = params.password;

    User.findOne({email: email}, (err,user) => {
        if (err) return res.status(500).send({message:'Error en la peticion'});

        if(user){
            bcrypt.compare(password,user.password, (err, check) => {
                if(check){
                    // Devolver datos de usuario
                    if(params.getToken){
                        // devolver token
                        return res.status(200).send({token: jwt.createToken(user)});
                    }else{
                        // devolver datos de usuario
                        user.password = undefined;
                        return res.status(200).send({user});
                    }
                }else{
                    return res.status(404).send({message:'El usuario no se ha podido identificar'});  
                }

            });
        }else{
            return res.status(404).send({message:'El usuario no se ha podido identificar!!'});  
        }
    });

}

module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser
}