const mongoose= require('mongoose')
const products = require('../models/productModel')
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        unique: true,
        required:true
    },
    block:{
        type:Boolean,
        required:true
    },
    Date:{
        type:Date,
        required:true,
        default:Date.now()
    },
    token:{
        type:String,
        required:true,
        default:''
    },
    cart:[{
            productId:{
                type:mongoose.Types.ObjectId,
                ref:'products',
                required:true
            },
            price:{
                type:Number
            },
            qty:{
                type:Number,
                required:true ,
                default:0
            },
            productTotalPrice: {
                type: Number,
                required: true,
              }
        
    }],
    cartTotalPrice: {
      type: Number
      
    },
    wishlist: [{
        product: {
          type: mongoose.Types.ObjectId,
          ref: "products",
          required: true
        }
      }]
})

module.exports = mongoose.model("users",userSchema)