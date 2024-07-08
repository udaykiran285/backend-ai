const express = require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const dotenv = require("dotenv")
const jwt = require("jsonwebtoken")
const cors = require("cors")


const app = express()
app.use(express.json())
app.use(cors());
dotenv.config();

const User = require("./userModel")

mongoose.connect(process.env.MONGO_URI).then(()=>{
    app.listen(process.env.PORT || 8000 , (err) => {
        if(err) console.log(err);
        console.log("Running Successfully at",process.env.PORT);
    })
}).catch((e) => {
    console.error("MongoDB connection error:", e);
    process.exit(1);
})

app.post("/signup",async (req,res) => {
   const {fullname,gmail,password} = req.body
   try{
        const findUser = await User.findOne({gmail : gmail})

        if(findUser){
            return res.status(400).json({userExist : true})
        }
        const hashedPassword = await bcrypt.hash(password,10)
        const userData = await User.create({
            fullname : fullname,
            gmail : gmail,
            password : hashedPassword,
            })
        const payload = {gmail : gmail}
        const jwtToken = jwt.sign(payload,"MY_SECRET_KEY")
        res.status(200).send({
            jwtToken : jwtToken
        })
   }catch(e){
        console.error(e.message);
        res.status(400).json({ error: e.message });
   }
})

app.post("/login",async (req,res) => {
    const {gmail,password} = req.body
    const userData = await User.findOne({gmail : gmail})
    try{
        if(!userData){
            return res.status(400).json("PLease Signup")
        }
        const isValidPassword = await bcrypt.compare(password,userData.password)
        if(isValidPassword){
            const payload = {gmail : gmail}
            const jwtToken = jwt.sign(payload,"MY_SECRET_KEY")
            res.status(200)
            res.send({jwtToken})
        }
        else{
            res.status(400).json("Wrong Password")
        }
    }
    catch(e){
        console.error(e.message);
        res.status(500).json({ error: e.message });
    }
})

app.get("/",async (req,res) => {
    res.send("Home Page")
})