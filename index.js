const mongoose= require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/webapp')

require('dotenv').config()

const express = require("express")

const session = require('express-session')

const bodyParser=require('body-parser')


const app= express()

const nocache = require("nocache")

app.use(nocache())

app.use(session({
    secret:"this is my secret"
}))

const adminroute = require('./routes/AdminRoute')
const userroute = require('./routes/Userroutes')


const path= require("path")

const logger = require("morgan")

// app.use(logger('dev'));
app.use(express.static(path.join(__dirname,"public")))

app.set("view engine","ejs")


app.use("/admin",adminroute)
app.use('/',userroute)



app.listen(4000,()=>{
    console.log("server started.....");
})



module.exports={
    app
}