// <------------------------------------------------------------------------------------------------------------------>
// <------------------------------------------------------------------------------------------------------------------>

const admin = require('../models/adminModel')

const user = require('../models/userModel')

const product = require('../models/productModel')

const catagory = require('../models/catagory')

const brand = require('../models/brandsModel')

const coupon = require('../models/couponModel')

// <------------------------------------------------------------------------------------------------------------------>
// <------------------------------------------------------------------------------------------------------------------>



module.exports ={
    do_add_cart: async (req,res,next)=>{
      try {
        let exist = await user.findOne({email:req.session.email,'cart.productId':req.params.id})

        if(exist){

          exist = null
          res.json({failed : true})
        }else{

        const products = await product.findOne({_id:req.params.id})
        const userData = await user.findOne({email:req.session.email})
        const totalprice = userData.cartTotalPrice + products.price
        const  result =  await  user.updateOne({email:req.session.email},{$push:{cart:{productId:products._id,qty:1,price:products.price,productTotalPrice:products.price}}})
         
        await user.updateOne({email:req.session.email},{$set:{cartTotalPrice:totalprice}})
        
          res.json({success : true})
       
        }
      } catch (error) {
        res.render("user_error")

      }
    },  
    show_cart: async (req,res,next)=>{
      try {

        const data = user.findOne({email:req.session.email})
        const cartData=await user.findOne({email:req.session.email}).populate('cart.productId').exec()
        res.render('cart/cart',{cartData,users:true})

      } catch (error) {
      next()
      }
       
    },
    changeqty: async (req,res,next)=>{
      try {
        const count = req.body.count
        const prodId = req.body.product
        const ss = await product.findById(prodId)

        const inc = await user.updateOne({ email: req.session.email, "cart.productId": prodId }, {$inc: { 'cart.$.qty': count } })

        const productdetails = await product.findOne({_id:prodId})
        const users = await user.findOne({ email: req.session.email })
     
        const qnty = await user.findOne({email: req.session.email , "cart.productId": prodId }, { "cart.$": 1 })
        const productprice = productdetails.price * qnty.cart[0].qty


        const inctotal = await user.updateOne({ _id: users._id, "cart.productId": prodId }, {$set: { 'cart.$.productTotalPrice': productprice }})
        const cart = await user.findOne({ email: req.session.email }).populate('cart.productId').exec()

        let cartTotal = 0;
        for (let i = 0; i < cart.cart.length; i++) {
        cartTotal += cart.cart[i].productTotalPrice;
        }

        const totalAmount = await user.updateOne({ email: req.session.email }, {$set: { cartTotalPrice: cartTotal }})
      
        res.json({ success: true,productprice,cartTotal})
    
      
      } catch (error) {
      next()
      }
    },

   //  !---------------------------------------------------------!

    delete_item: async (req,res,next)=>{
      try {
       const result = await user.updateOne({email:req.session.email},{$pull:{cart:{productId:req.params.id}}})
       const rew = await user.findOne({email:req.session.email})

       let tcprice= 0

       for(var i=0; i< rew.cart.length ; i++){
       tcprice = tcprice+rew.cart[i].productTotalPrice
       }

       const yy = await user.updateOne({email:req.session.email},{$set:{cartTotalPrice:tcprice}})
      
       const cartData=await user.findOne({email:req.session.email}).populate('cart.productId').exec()

       res.json({success:true})

      } catch (error) {
        res.render("user_error")

      }   
    },
    //  !---------------------------------------------------------!


}