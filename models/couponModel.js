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
    maxdiscountprice:{
        type:Number
    },
    discountpercentage:{
        type:Number
    },
    date:{
    type:Date
    },
    code:{
        type:String
    },
    used:{
        type:Array
    }
})



module.exports = mongoose.model('coupon',couponSchema)