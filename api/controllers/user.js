'user strict'

var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var Follow = require('../models/follow');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');

var mongoosePaginate = require('mongoose-pagination');

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

// conseguir datos de un usuario
function getUser(req,res){
    var userId = req.params.id;
    User.findById(userId, (err, user) => {
        if(err) return res.status(500).send({message:'Error en la peticion'});
        if(!user) return res.status(404).send({message:'El usuario no existe'});

        console.log(req.user.sub);
        console.log(userId);
        
        Follow.findOne({'user':req.user.sub, 'followed':userId}).exec((err,following)=>{
            if(err) return res.status(500).send({message: 'Error al comprobar el seguimiento'});
            
            Follow.findOne({'user':userId, 'followed':req.user.sub}).exec((err,followed)=>{
                if(err) return res.status(500).send({message: 'Error al comprobar el seguimiento'});
                return res.status(200).send({user, following , followed});
            });
        });
    });
}

async function followThisUser(identity_user_id, user_id){
    var following = await Follow.findOne({'user':identity_user_id, 'followed':user_id}).exec((err,follow)=>{
        if(err) return handleError(err);
        return follow;
    });

    var follower = await Follow.findOne({'user':user_id, 'followed':identity_user_id}).exec((err,follow)=>{
        if(err) return handleError(err);
        return follow;
    });

    return {
        following:following,
        followed:followed
    }
}

// devolver un listado de usuarios paginados
function getUsers(req,res){
    var identity_user_id = req.user.sub;
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage = 5;

    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) =>{
        if(err) return res.status(500).send({message:'Error en la peticion'});
        if(!users) return res.status(404).send({message:'No hay usuarios disponibles'});

        return res.status(200).send({
            users,
            total,
            pages: Math.ceil(total/itemsPerPage)
        })
    });
}

// edicion de datos de usuario
function updateUser(req,res){
    var userId = req.params.id;
    var update = req.body;

    // borrar propiedad password
    delete update.password;

    if(userId != req.user.sub){
        return res.status(500).send({message:'No tienes permiso para actualizar los datos del usuario'});
    }

    User.findByIdAndUpdate(userId, update, {new:true}, (err, userUpdated) =>{
        if(err) return res.status(500).send({message:'Error en la peticion'});
        if(!userUpdated) return res.status(404).send({message:'No se ha podido actualizar el usuario'});
        
        return res.status(200).send({user: userUpdated});
    });
}

// subir archivos de imagen/avatar de usuario
function uploadImage(req, res){
    var userId = req.params.id;


    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if(userId != req.user.sub){
            return removeFilesOfUploads(res,file_path, 'No tienes permiso para actualizar los datos del usuario');
        }

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
            // Actualizar documento de usuario logueado

            User.findByIdAndUpdate(userId,{image: file_name}, {new:true}, (err,userUpdated)=>{
                if(err) return res.status(500).send({message:'Error en la peticion'});
                if(!userUpdated) return res.status(404).send({message:'No se ha podido actualizar el usuario'});
                
                return res.status(200).send({user: userUpdated});
            });

        }else{
            return removeFilesOfUploads(res,file_path, 'Extension no valida');
        }

    }else{
        res.status(200).send({message:'No se han subido archivos'});
    }
}

function removeFilesOfUploads(res,file_path, messageErr) {
    fs.unlink(file_path , (err)=>{
        res.status(200).send({message:messageErr});    
    });
}


function getImageFile(req,res){
    var image_file = req.params.imageFile;
    var path_file = './uploads/users/'+image_file;

    fs.exists(path_file, (exists) =>{
        if(exists){
            return res.sendFile(path.resolve(path_file));
        }else{
            return res.status(200).send({message:'No existe la imagen'});
        }
    })
}

module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    updateUser,
    uploadImage,
    getImageFile
}