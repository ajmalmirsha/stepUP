const mongoose= require('mongoose')

const catagorySchema= new mongoose.Schema({
    catagory_name:{
        type:String,
        unique: true,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:String
    },
    unlisted:{
        type:Boolean,
        default:false
    }
    
})


module.exports = mongoose.model('Catagory',catagorySchema)