var express = require("express");
var mongoose = require("mongoose");
var jwt = require("jsonwebtoken");
var router = express.Router();

// Token generation imports
const dotenv = require('dotenv');
// get config vars
dotenv.config();

var debug = require("debug")("moviesAppAuth:server");

//Models
var User = require("../models/User.js");

mongoose.set("strictQuery", false);
var db = mongoose.connection;

function tokenVerify (req, res, next) {
    var authHeader=req.get('authorization');
    const retrievedToken = authHeader.split(' ')[1];
    
    if (!retrievedToken) {
        res.status(401).send({
            ok: false,
            message: "Token inválido"
        })
    }else{       
        jwt.verify(retrievedToken, process.env.TOKEN_SECRET,  function (err, retrievedToken) {
            if (err) {
                res.status(401).send({
                    ok: false,
                    message: "Token inválido"
                });
            } else {
                next();
            }
        });
    }
}

router.get("/secure", tokenVerify, 
function (req, res, next) {
    debug("Acceso seguro con token a los usuarios");
    User.find().sort("-creationdate").exec(function (err, users) {
        if (err) res.status(500).send(err);
        else res.status(200).json(users);
    })
});

router.get("/",
function (req, res, next) {
    User.find().sort("-creationdate").exec(function (err, users) {
        if (err) res.status(500).send(err);
        else res.status(200).json(users);
    })
});


// GET de un único usuario por su Id
router.get("/secure/:id", tokenVerify, function (req, res, next) {
    debug("Acceso seguro con token a un usuario");
    User.findById(req.params.id, function (err, userinfo) {
        if (err) res.status(500).send(err);
        else res.status(200).json(userinfo);
    });
});

// POST de un nuevo usuario
router.post("/", function (req, res, next) {
    User.create(req.body, function (err, userinfo) {
        if (err) res.status(500).send(err);
        else res.sendStatus(200);
    });
});

// POST de un nuevo usuario
router.post("/secure", tokenVerify, function (req, res, next) {
    debug("Creación de un usuario segura con token");
    User.create(req.body, function (err, userinfo) {
        if (err) res.status(500).send(err);
        else res.sendStatus(200);
    });
});

router.put("/secure/:id", tokenVerify, function (req, res, next) {
    debug("Modificación segura de un usuario con token");
    User.findByIdAndUpdate(req.params.id, req.body, function (err, userinfo) {
        if (err) res.status(500).send(err);
        else res.sendStatus(200);
    });
});

// DELETE de un usuario existente identificado por su Id
router.delete("/secure/:id", tokenVerify, function (req, res, next) {
    debug("Borrado seguro de un usuario con token");
    User.findByIdAndDelete(req.params.id, function (err, userinfo) {
        if (err) res.status(500).send(err);
        else res.sendStatus(200);
    });
});

// DELETE de un usuario existente identificado por su Id
router.delete("/:id", function (req, res, next) {
    User.findByIdAndDelete(req.params.id, function (err, userinfo) {
        if (err) res.status(500).send(err);
        else res.sendStatus(200);
    });
});

router.post("/signin", 
function (req, res, next) {
    debug("login");
        User.findOne({
            username: req.body.username
        }, function (err, user) {
            if (err) { //error al consultar la BBDD
                res.status(500).send("¡Error comprobando el usuario!");
            }
            if (user != null) { //El usuario existe (ahora a ver si coincide el password)
                debug("El usuario existe");
                user.comparePassword(req.body.password, 
                     function (err, isMatch) {
                          if (err) res.status(500).send("¡Error comprobando el password!");
                          if (isMatch){  
                                next(); //pasamos a generar el token
                          }else
                                res.status(401).send({
                                   message: "Password no coincide"
                          });    
                    }
                );
            }
            else { //El usuario NO existe en la base de datos
                res.status(401).send({
                    message: "Usuario no existe"
                });
            }
        });
},
function (req, res, next) {
    debug("... generando token");
    jwt.sign({username: req.body.username},process.env.TOKEN_SECRET, {expiresIn: 3600 // expira en 1 hora...
    }, function(err, generatedToken) {
        if (err) res.status(500).send("¡Error generando token de autenticación");
        else res.status(200).send({
            message: generatedToken
       });
    });
});

module.exports = router;