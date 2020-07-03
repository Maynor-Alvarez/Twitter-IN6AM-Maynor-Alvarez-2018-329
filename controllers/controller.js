'use strict'

var User = require('../models/user.model');
var Tweet = require('../models/twitter.model');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var auth = require('../middlewares/authenticated');


function commands(req, res) {
    let user = new User();
    let tweet = new Tweet();
    let params = req.body;
    let userData = Object.values(params); 
    let resp = userData.toString().split(" ");


        if (resp[0] == 'register') {
            if (resp[1] != null && resp[2] != null && resp[3] != null && resp[4] != null) {
                User.findOne({ $or: [{ email: resp[2] }, { username: resp[3] }] }, (err, userFind) => {
                    if (err) {
                        res.status(500).send({ message: 'Error en el sistema' });
                    } else if (userFind) {
                        res.send({ message: 'Usuario o correo ya en uso' });
                    } else {
                        user.name = resp[1];
                        user.email = resp[2];
                        user.username = resp[3];
                        user.password = resp[4];

                        bcrypt.hash(resp[4], null, null, (err, hashPass) => {
                            if (err) {
                                res.status(500).send({ message: 'Error de encriptación' });
                            } else {
                                user.password = hashPass;

                                user.save((err, userSaved) => {
                                    if (err) {
                                        res.status(500).send({ message: 'Error en el servidor.' });
                                    } else if (userSaved) {
                                        res.send({ user: userSaved })
                                    } else {
                                        res.status(404).send({ message: 'Erro al registrar usuario' });
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                res.send({ message: 'Ingrese los datos requeridos' })
            }
        }


        if (resp[0] == 'login') {
            if (resp[1] != null && resp[2] != null) {
                User.findOne({ $or: [{ username: resp[1] }, { email: resp[1] }] }, (err, userFind) => {
                    if (err) {
                        res.status(500).send({ message: 'Error en el sistema' });
                    } else if (userFind) {
                        bcrypt.compare(resp[2], userFind.password, (err, checkPass) => {
                            if (err) {
                                res.status(500).send({ message: 'Error en el servidor.' });
                            } else if (checkPass) {
                                if (resp[3] == 'true') {
                                    res.send({ token: jwt.createToken(userFind) });
                                } else {
                                    res.send({ user: userFind });
                                }
                            } else {
                                res.send({ message: 'Contraseña incorrecta' });
                            }
                        });
                    } else {
                        res.send({ message: 'Usuario no se ha encontrado' });
                    }
                });
            } else {
                res.send({ message: 'Ingrese usuario y contraseña' });
            }
        }


        if (resp[0] == 'add_tweet') {
            if (resp[1] != null) {

                tweet.description = resp.join(' ');
                tweet.description = tweet.description.replace('add_tweet', '');
                tweet.description = tweet.description.replace(' ', '');

                tweet.save((err, tweetSaved) => {
                    if (err) {
                        res.status(500).send({ message: 'Error en el sistema' });
                    } else if (tweetSaved) {
                        res.send({ tweet: tweetSaved });
                    } else {
                        res.status(404).send({ message: 'No se ha podido publicar el tweet' });
                    }
                });
            } else {
                res.send({ message: 'Ingrese contenido a su tweet'});
            }
        }


        if (resp[0] == 'set_tweet') {
            if (resp[1] != null) {
                Tweet.findById(resp[1], (err, tweetFind) => {
                    if (err) {
                        res.status(500).send({ message: 'Error en el sistema' });
                    } else if (tweetFind) {
                        User.findByIdAndUpdate(resp[2], { $push: { tweets: resp[1] } }, { new: true }, (err, userUpdated) => {
                            if (err) {
                                res.status(500).send({ message: 'Error en el servidor' });
                            } else if (userUpdated) {
                                res.send({ user: userUpdated });
                            } else {
                                res.status(500).send({ message: 'No se ha podido insertar el tweet' });
                            }
                        });
                    } else {
                        res.send({ message: 'no se ha encontrado el tweet' });
                    }
                });
            } else {
                res.send({ message: 'debe ingresar el Id del tweet' });
            }
        }


        if (resp[0] == 'edit_tweet') {
            if (resp[1] != null) {
                if (resp[2] != null) {
                    tweet.description = resp.join(' ');
                    tweet.description = tweet.description.replace('edit_tweet', '');
                    tweet.description = tweet.description.replace(resp[1], '');
                    tweet.description = tweet.description.replace('  ', '');

                    var update = tweet.description;
                    
                    Tweet.findByIdAndUpdate(resp[1], { $set: { description: update } }, { new: true }, (err, tweetUpdated) => {
                        if (err) {
                            res.status(500).send({ message: 'Error en el sistema' });
                        } else if (tweetUpdated) {
                            res.send({ tweet: tweetUpdated });
                        } else {
                            res.status(404).send({ message: 'error al actualizar el tweet' });
                        }
                    });
                } else {
                    res.send({ message: 'debe ingresar contenido al tweet' });
                }
            } else {
                res.send({ message: 'Ingrese el Id del tweet' });
            }
        }

        if (resp[0] == 'delete_tweet') {
            if (resp[1] != null) {
                User.findByIdAndUpdate(req.user.sub, { $pull: { tweets: resp[1] } }, { new: true }, (err, deleted) => {
                    if (err) {
                        res.status(500).send({ message: 'Error en el sistema' });
                    } else if (deleted) {
                        Tweet.findByIdAndRemove(resp[1], (err, tweetFind) => {
                            if (err) {
                                res.status(500).send({ message: 'Error en el servidor' });
                            } else if (tweetFind) {
                                res.send({ user: deleted });
                            } else {
                                res.status(404).send({ message: 'No se ha encotrado el tweet' });
                            }
                        });
                    } else {
                        res.status(404).send({ message: 'No se ha podido eliminar el tweet' });
                    }
                });
            } else {
                res.send({ message: 'debe ingresar el id del tweet que desea eliminar' });
            }
        }


        if (resp[0] == 'view_tweets') {
            if (resp[1] != null) {
                User.findOne({ username: { $regex: resp[1], $options: 'i' } }, (err, userFind) => {
                    if (err) {
                        res.status(500).send({ message: 'Error en el sistema' });
                    } else if (userFind) {
                        User.find({ username: resp[1] }, { tweets: 1, _id: 0 }, (err, tweets) => {
                            if (err) {
                                res.status(500).send({ message: 'Error en el servidor' });
                            } else {
                                Tweet.populate(tweets, { path: "tweets" }, (err, tweets) => {
                                    if (err) {
                                        res.status(500).send({ message: 'Error en el sistema' });
                                    } else if (tweets) {
                                        res.send({ user: resp[1], tweets });
                                    } else {
                                        res.status(404).send({ message: 'error al mostrar los tweets' });
                                    }
                                });
                            }
                        });
                    } else {
                        res.send({ message: 'Usuario no encontrado' });
                    }
                });
            } else {
                res.send({ message: 'debe ingresar un usuario' });
            }
        }


        if (resp[0] == 'follow') {
            if (resp[1] != null) {
                User.findOne({ username: { $regex: resp[1], $options: 'i' } }, (err, userFind) => {
                    if (err) {
                        res.status(500).send({ message: 'Error en el sistema' });
                    } else if (userFind) {
                        User.findOneAndUpdate({ username: resp[1] }, { $push: { followers: req.user.sub } }, { new: true }, (err, followed) => {
                            if (err) {
                                res.status(500).send({ message: 'Error en el servidor' });
                            } else if (followed) {
                                res.send({ user: followed });
                            } else {
                                res.status(404).send({ message: 'error al seguir al usuario' });
                            }
                        });
                    } else {
                        res.send({ message: 'Usuario no encontrado' });
                    }
                });
            } else {
                res.send({ message: 'debe ingresar el usuario a seguir' });
            }
        }


        if (resp[0] == 'unfollow') {
            if(resp[1] != null){
                User.findOne({username: {$regex: resp[1], $options: 'i'} }, (err, userFind)=>{
                    if(err){
                        res.status(500).send({message: 'Error en el sistema'});
                    }else if(userFind){ 
                                User.findOneAndUpdate({username: resp[1]},{$pull:{followers: auth.idUser}}, {new:true}, (err, unfollow)=>{
                                    if(err){
                                        res.status(500).send({message: 'Error en el servidor'});
                                    }else if(unfollow){
                                        res.send({message: 'Haz dejado de seguir a ' + resp[1]});
                                    }else{
                                        res.status(404).send({message: 'error al dejar de seguir al usuario'});
                                    }
                                });
                    }else{
                        res.status(404).send({message: 'Usuario no encontrado'});
                    }
                });
            }else{
                res.send({message: 'debe ingresar el usuario que desea dejar de seguir'});
            }
        }
}


module.exports = {
    commands
}