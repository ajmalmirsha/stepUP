const mongoose= require('mongoose')

const couponSchema= new mongoose.Schema({
   coupon_name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number
    },
    discountPrice:{
        type:Number
    },
    code:{
        type:String
    }
})


module.exports = mongoose.model('coupon',couponSchema)