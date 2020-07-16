require("dotenv").config();
const bodyparser = require("body-parser");
const ejs = require("ejs");
const express = require("express");
const mongoose = require("mongoose");
//const encrypt = require("mongoose-encryption");
//const md5 = require("md5");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
const session = require("express-session");
const passport = require("passport");
const passportLocalmongoose = require("passport-local-mongoose");

const app = express();
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended:true}));

app.use(session({
  secret : "Our littilre secret.",
  resave : false,
  saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB",{ useUnifiedTopology: true,useNewUrlParser: true,});
mongoose.set("useCreateIndex",true);

const userSchema = new mongoose.Schema({
  email:String,
  password:String
});

userSchema.plugin(passportLocalmongoose);

//console.log(md5("123456"));


//userSchema.plugin(encrypt,{secret: process.env.SECRET,encryptedFields:["password"],});

const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.route("/")
.get(function(req,res){
  res.render("home");
});

app.route("/secret")
.get(function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login");
  }
});

app.route("/login")
.get(function(req,res){
  res.render("login");
})
.post(function(req,res){
  const user = new User({
    username : req.body.username,
    password : req.body.password
  });

  req.login(user,function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secret");
      });
    }
  });
});

app.route("/logout")
.get(function(req,res){
  req.logout();
  res.redirect("/");
});
// .post(function(req,res){
//   const username = req.body.username;
//   const password = req.body.password;
//   User.findOne({email:username},function(err,result){
//     if(err){
//       console.log(err);
//     }else{
//       if(result){
//         bcrypt.compare(password,result.password,function(err,resl){
//           if(resl==true){
//             res.render("secrets");
//           }
//         });
//       }
//     }
//   });



app.route("/register")
.get(function(req,res){
  res.render("register");
})
.post(function(req,res){
  User.register({username:req.body.username},req.body.password,function(err,user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secret");
      });
    }
  });
});

// .post(function(req,res){
//   bcrypt.hash(req.body.password,saltRounds,function(err,hash){
//     const newuser = new User({
//       email:req.body.username,
//       password:hash
//     });
//     newuser.save(function(err){
//       if(err){
//         console.log(err);
//       }else{
//         res.render("secrets");
//       }
//   });
//
// });



app.listen(3000,function(){
  console.log("server is running on portal 3000.");
});
