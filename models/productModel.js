
const mongoose= require('mongoose');
const catagory = require('./catagory');

const productSchema= new mongoose.Schema({
    productname:{
        type:String,
        required:true
    },
    catagory:{
        type:mongoose.Types.ObjectId,
        ref:'Catagory',
        required: true
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    image:{
       type:Array,
       required:true
    },
    brand:{
        type:String,
        required:true
    },
    unlisted:{
        type:Boolean,
        required:true,
        default:false
    },
    Date:{
        type:Date,
        required:true,
        default:Date.now()
    }
})


module.exports = mongoose.model('products',productSchema)