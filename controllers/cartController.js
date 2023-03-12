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
    do_add_cart: async (req,res)=>{
      try {
        let exist = await user.findOne({email:req.session.email,'cart.productId':req.params.id})

        if(exist){

          exist = null
          console.log("item already exist in cart !!");
          res.json({failed : true})
        }else{

        const products = await product.findOne({_id:req.params.id})
        const userData = await user.findOne({email:req.session.email})
        const totalprice = userData.cartTotalPrice + products.price
        const  result =  await  user.updateOne({email:req.session.email},{$push:{cart:{productId:products._id,qty:1,price:products.price,productTotalPrice:products.price}}})
         
        await user.updateOne({email:req.session.email},{$set:{cartTotalPrice:totalprice}})
        
        if(result){
          res.json({success : true})
         console.log('added item to cart');
        }else{
        console.log('added not item to cart');
        }
        }
      } catch (error) {
        console.log(error.message);
      }
    },  
    show_cart: async (req,res)=>{
      try {

        console.log("showing cart...");
        const data = user.findOne({email:req.session.email})
        const cartData=await user.findOne({email:req.session.email}).populate('cart.productId').exec()
        res.render('cart/cart',{cartData,users:true})

      } catch (error) {
        console.log(error.message);
      }
       
    },
    changeqty: async (req,res,next)=>{
      try {
        
        console.log("change qty function reached !!!");

        const count = req.body.count
        const prodId = req.body.product
        // const counter =  count - (count *2)
        // console.log(counter);

        const ss = await product.findById(prodId)
      

        // const ObjectId = require('mongodb').ObjectId;

      //   const counter = await user.findOne({ 
      //   email: req.session.email,
      //   "cart.productId": prodId
      // }).populate("cart.productId")
  
      //  console.log("ss.quantity :"+ss.quantity);
      
      //  console.log("counter.qty :"+counter.cart[0].qty);
      //  if(ss.quantity > counter.cart[0].qty){


      //      console.log(counter);
       

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

        if(inc){
        console.log("done inc");
        }else{
        console.log("failedddddd");
        }
    
      
      } catch (error) {
        console.log(error.message);
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

       console.log("deleted from cart....");
       res.json({success:true})
      //  res.redirect('/show-cart')

      } catch (error) {
        console.log(error.message);
      }   
    },
    //  !---------------------------------------------------------!

    coupon_apply: async (req,res)=>{
      try {
       const coupons = await coupon.findOne({code:req.body.coupon})
       const cartData=await user.findOne({email:req.session.email}).populate('cart.productId').exec()

       if(coupons){
       const carttotal = cartData.cartTotalPrice - coupons.discountPrice
      
       res.render('cart/cart',{cartData,coupons})
       console.log("coupon applied...");
       }
      } catch (error) {
       console.log(error.message);
      }
    }
    //  !---------------------------------------------------------!

}