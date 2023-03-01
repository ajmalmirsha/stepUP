
const mongoose= require('mongoose')

const bannerSchema= new mongoose.Schema({
    title:{
        type:String
    },
    image:{
        type:String,
        required:true
    }
})


module.exports = mongoose.model('banner',bannerSchema)