require("dotenv").config();
const bodyparser = require("body-parser");
const ejs = require("ejs");
const express = require("express");
const mongoose = require("mongoose");
//const encrypt = require("mongoose-encryption");
//const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended:true}));
mongoose.connect("mongodb://localhost:27017/userDB",{ useUnifiedTopology: true,useNewUrlParser: true,});

const userSchema = new mongoose.Schema({
  email:String,
  password:String
});

//console.log(md5("123456"));


//userSchema.plugin(encrypt,{secret: process.env.SECRET,encryptedFields:["password"],});

const User = new mongoose.model("User",userSchema);


app.route("/")
.get(function(req,res){
  res.render("home");
});

app.route("/login")
.get(function(req,res){
  res.render("login");
})
.post(function(req,res){
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({email:username},function(err,result){
    if(err){
      console.log(err);
    }else{
      if(result){
        bcrypt.compare(password,result.password,function(err,resl){
          if(resl==true){
            res.render("secrets");
          }
        });
      }
    }
  });
});


app.route("/register")
.get(function(req,res){
  res.render("register");
})
.post(function(req,res){
  bcrypt.hash(req.body.password,saltRounds,function(err,hash){
    const newuser = new User({
      email:req.body.username,
      password:hash
    });
    newuser.save(function(err){
      if(err){
        console.log(err);
      }else{
        res.render("secrets");
      }
  });

});
});


app.listen(3000,function(){
  console.log("server is running on portal 3000.");
});
