'use strict'

var path = require('path');
var fs = require('fs');
var moongosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');

function prueba(req,res){
    return res.status(200).send({message:'Hola mundo desde el controlador follow'})
}

function saveFollow(req,res){
    var params = req.body;

    var follow = new Follow();
    follow.user = req.user.sub;
    follow.followed = params.followed;

    follow.save((err, followStored) =>{
        if(err) return res.status(500).send({message:'Error al guardar el seguimiento'});
        if(!followStored) return res.status(404).send({message:'El seguimiento no se ha guardado'});

        return res.status(200).send({follow: followStored});
    });

}

function deleteFollow(req, res){
    var userId = req.user.sub;
    var followId = req.params.id;

    Follow.find({'user': userId, 'followed': followId}).remove(err =>{
        if(err) res.status(500).send({message:'Error al dejar de seguir'});

        return res.status(200).send({message:'El follow se ha eliminado!!'});
    });
}

function getFollowingUsers(req,res){
    var userId = req.user.sub;

    if(req.params.id && req.params.page){
        userId = req.params.id;
    }

    var page = 1;

    if(req.params.page){
        page = req.params.page;
    }else{
        page = req.params.id;
    }

    var itemsPerPage = 4;

    Follow.find({'user':userId}).populate({path: 'followed'}).paginate(page, itemsPerPage, (err, follows, total) =>{
        if(err) res.status(500).send({message:'Error en el servidor'});
        if(!follows) res.status(404).send({message: 'No estas siguiendo a ningun usuario'});

        Follow.find({'user':req.user.sub}).select({'_id':0, '__v':0, 'user':0}).exec((err, followings)=>{
            if(err) return res.status(500).send({message:'Error en la peticion'});

            Follow.find({'followed':req.user.sub}).select({'_id':0, '__v':0, 'followed':0}).exec((err, followeds)=>{
                if(err) return res.status(500).send({message:'Error en la peticion'});

                var follows_clean = [];
                followings.forEach((follow) => {
                    follows_clean.push(follow.followed);
                });
                
                var followeds_clean = [];
                followeds.forEach((follow) => {
                    followeds_clean.push(follow.user);
                });

                return res.status(200).send({
                    total: total,
                    pages: Math.ceil(total/itemsPerPage),
                    users_following : follows_clean,
                    users_follow_me: followeds_clean,
                    follows
                });
               
            });
        });        
    });
}

function getFolledUser(req,res) {
    var userId = req.user.sub;

    if(req.params.id && req.params.page){
        userId = req.params.id;
    }

    var page = 1;

    if(req.params.page){
        page = req.params.page;
    }else{
        page = req.params.id;
    }

    var itemsPerPage = 4;

    Follow.find({'followed':userId}).populate('user').paginate(page, itemsPerPage, (err, follows, total) =>{
        if(err) res.status(500).send({message:'Error en el servidor'});
        if(!follows) res.status(404).send({message: 'No te sigue ningun usuario'});

        Follow.find({'user':req.user.sub}).select({'_id':0, '__v':0, 'user':0}).exec((err, followings)=>{
            if(err) return res.status(500).send({message:'Error en la peticion'});

            Follow.find({'followed':req.user.sub}).select({'_id':0, '__v':0, 'followed':0}).exec((err, followeds)=>{
                if(err) return res.status(500).send({message:'Error en la peticion'});

                var follows_clean = [];
                followings.forEach((follow) => {
                    follows_clean.push(follow.followed);
                });
                
                var followeds_clean = [];
                followeds.forEach((follow) => {
                    followeds_clean.push(follow.user);
                });

                return res.status(200).send({
                    total: total,
                    pages: Math.ceil(total/itemsPerPage),
                    users_following : follows_clean,
                    users_follow_me: followeds_clean,
                    follows
                });
               
            });
        });     
    });
}

// Devolver usuarios que sigo o me siguen
function getMyFollows(req,res){
    var userId = req.user.sub;

    var find = Follow.find({user:userId});
    if(req.params.followed){
        find = Follow.find({followed :userId});
    }

    find.populate('user followed').exec((err, follows) =>{
        if(err) res.status(500).send({message:'Error en el servidor'});
        if(!follows) res.status(404).send({message: 'No sigues a ningun usuario'});

        return res.status(200).send({
            follows
        });
    });
}



module.exports = {
    prueba,
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFolledUser,
    getMyFollows
}

