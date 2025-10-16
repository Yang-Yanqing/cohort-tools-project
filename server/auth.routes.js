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

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Valid question" });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Password incorecto" });
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({ message: "登录成功", token });
  } catch (error) {
    res.status(500).json({ message: "登录失败", error });
  }
});
router.get("/verify", (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "未提供token" });

    const decoded = jwt.verify(token, SECRET);
    res.status(200).json({ message: "验证成功", decoded });
  } catch (error) {
    res.status(401).json({ message: "无效或过期token", error });
  }
});

module.exports = router;




