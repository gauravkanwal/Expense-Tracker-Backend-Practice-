require('dotenv').config();
const express = require('express');
const  mongoose = require('mongoose');
const userModel=require('./models/user');
const expenseModel=require('./models/expense');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken')
const cookieParser = require("cookie-parser");


const app= express();
app.use(express.json());
app.use(cookieParser());


mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log('MongoDB connected!')
})
.catch(err=>{
    console.error('Mongo connection error:' ,err);
})

app.get('/',(req,res)=>{
    console.log("hey");
    res.send("welcome to the app")
})

app.post('/signup',async (req,res)=>{
try {
        const {userName,email,password}=req.body;
        let user=await userModel.findOne({email:email});
        if(user) return res.status(400).send("User already registered!");
        
        const salt=await bcrypt.genSalt(10);//salt of ten rounds
        const hash=await bcrypt.hash(password,salt);
    
        const newUser=await userModel.create({
            userName,
            email,
            password:hash
        });
    
        const token=await jwt.sign({email:user.email,userName:newUser.userName,id:newUser._id},process.env.JWT_SECRET_KEY);
        res.cookie("token",token);
        res.status(200).send("User registered successfully")
} catch (err) {
        res.status(500).send("Something went wrong during signup! : "+err.message)   
}    
});

app.post('/login',async(req,res)=>{
try {
        const{email,password}=req.body;
        const user=await userModel.findOne({email});
        if(!user) res.status(400).send("User doesn't exist.");
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch) res.status(400).send("Invalid password.");
    
        const token=jwt.sign({email:user.email,userName:user.userName,id:user._id},process.env.JWT_SECRET_KEY);
        res.cookie("token",token);
        res.redirect("/dashboard");
    
} catch (err) {
    res.status(500).send("Something went wrong during login. "+ err.message);
}
});

const isLoggedIn=(req,res,next)=>{
const token=req.cookies.token;
if(!token) res.redirect('/login');
try {
    const data=jwt.verify(token,process.env.JWT_SECRET_KEY);
    req.user=data;
    next();
} catch (err) {
    res.redirect('/login');
}
}

app.get('/dashboard',isLoggedIn,async (req,res)=>{
    res.send(`Welcome ${req.user.userName}, this is your dashboard`);
});

app.get('/logout',(req,res)=>{
    try {
        res.clearCookie("token");
        res.redirect("/");
    } catch (error) {
        res.status(500).send("Something went wrong during logout!");
    }
});



app.listen(process.env.PORT);