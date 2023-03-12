const mongoose= require('mongoose')

const orderSchema= new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
      },
      orderId: {
        type: String,
        unique: true,
        required: true,
        // generate a custom order ID using uuid
      },
      date:{
       type:Date
      },
       address: {
        type: String,
        required: true,
      },
       product: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products',
            required: true,
          },
          qty:{
              type:Number
             
          } ,
          productTotalPrice:{
            type:Number
        }
      }
      ],
      cartTotalPrice: {
        type: Number,
      },
      discount:{
        type: Number,
        default:0
      },
      SubTotal:{
       type:Number
      },
      coupon:{
       type:Object
      },
      paymentMethod: {
        type: String,
        required:true,
      },
    
       status:{
        type:String,
        default:"pending"
       }
    });


module.exports = mongoose.model('order',orderSchema)