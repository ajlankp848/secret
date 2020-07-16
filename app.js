require("dotenv").config();
const bodyparser = require("body-parser");
const ejs = require("ejs");
const express = require("express");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended:true}));
mongoose.connect("mongodb://localhost:27017/userDB",{ useUnifiedTopology: true,useNewUrlParser: true,});

const userSchema = new mongoose.Schema({
  email:String,
  password:String
});

console.log(process.env.API_KEY);


userSchema.plugin(encrypt,{secret: process.env.SECRET,encryptedFields:["password"],});

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
        if(result.password===password){
          res.render("secrets");
        }
      }
    }
  });
});

app.route("/register")
.get(function(req,res){
  res.render("register");
})
.post(function(req,res){
  const newuser = new User({
    email:req.body.username,
    password:req.body.password
  });
  newuser.save(function(err){
    if(err){
      console.log(err);
    }else{
      res.render("secrets");
    }
  })
});


app.listen(3000,function(){
  console.log("server is running on portal 3000.");
});
