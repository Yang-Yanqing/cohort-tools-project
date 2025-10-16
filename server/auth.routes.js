const express=require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User=require('./app/User.model')
const { SECRET } = require("../middleware/auth.middleware");
const router = require("express").Router();



router.post('/signup',async (req,res,next)=>{
    try{
         const {email,password,name}=req.body;
         const existUser=await User.findOne({email});
         if (existUser) return res.status(400).json({ message: "Valid question" });
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser=await User.create({email,password:hashedPassword,name});
        res.status(201).json({message:"Successfully!",user:newUser});
        }
    catch(err){res.status(500).json({message:"Faild",err})}    
})






