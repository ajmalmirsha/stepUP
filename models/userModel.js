const mongoose= require('mongoose')
const products = require('../models/productModel')
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique: true,
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
    wallet:{
      type: Number,
      default:0
    },
    wishlist: [{
        product: {
          type: mongoose.Types.ObjectId,
          ref: "products",
          required: true
        }
      }],
      address: [
        {
          name: {
            type: String,
            required: true
          },
          street: {
            type: String,
            required: true
          },
          district: {
            type: String,
            required: true
          },
          state: {
            type: String,
            required: true
          },
          pincode: {
            type: String,
            required: true
          },
          country: {
            type: String,
            required: true
          },
          phone: {
            type: Number,
            required: true
          },
        }
      ]
})

module.exports = mongoose.model("users",userSchema)