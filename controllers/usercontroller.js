const user = require('../models/userModel')

const bcrypt = require('bcrypt');
const session = require('express-session');

const product = require('../models/productModel')

const brand = require('../models/brandsModel')

const catagory = require('../models/catagory');
// const { brands } = require('./adminController');
const brands = require('../models/brandsModel')

const banners = require('../models/bannerModel');
const { populate } = require('../models/userModel');

const coupon = require('../models/couponModel');
const orderModel = require('../models/orderModel');

const moment = require('moment')

const { v4: uuidv4 } = require('uuid');




require('dotenv').config()


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;
const client = require('twilio')(accountSid, authToken);

const crypto=require('crypto');

const Razorpay =  require("razorpay");
const { findById } = require('../models/catagory');
const couponModel = require('../models/couponModel');
const { ObjectId } = require('mongodb');

var instance = new Razorpay({
    key_id:"rzp_test_7HTD9tSiIzs8Qo",
    key_secret:"fW1vsLpu6Tnv021ozgELGv4c"
})


const pageSize = 4


async function getProducts(page) {

    const skip = (page - 1) * pageSize
    const products = await product.find({ unlisted: false }).skip(skip).limit(pageSize).exec()
    return products

}


module.exports = {


    verifyOTP: async (req, res, next) => {

        try {
             const phone = req.session.user.phonenumber
             const otp = req.body.otp
             const userData = req.session.user
             const verifiedResponse = await client.verify._v2
                .services(serviceSid)
                .verificationChecks.create({
                    to: `+91${phone}`,
                    code: otp,
                }).then(async (verificationResponse) => {
                    console.log("verification response:");
                    console.log(verificationResponse);
                    console.log("verification response status:");
                    console.log(verificationResponse.status);
                    if (verificationResponse.status === 'approved') {
                        userData.password = await bcrypt.hash(userData.password, 10)
                        const data = new user({
                            username: userData.username,
                            email: userData.email,
                            password: userData.password,
                            phone: userData.phonenumber,
                            block: false,
                            token: "s"
                        })
                        const result = await data.save()
                        if (result) {
                           
                            req.session.email = req.body.email
                            req.session.user = true

                                  const dt =  await user.findOne({email:req.body.email})
                               req.session.userBody = dt

                            console.log("redirecting to user home");
                            res.redirect("/userhome")

                        } else {
                            res.render('otp/send_otp')
                        }
                    } else {
                        res.render('otp/send_otp', { err: 'wrong otp you have entered' })
                    }
                })
        } catch (error) {
            console.log(error.message);
        }
    },


    sendOTP: async (req, res, next) => {
        console.log("reached send otp");
        try {
            req.session.phnumber = req.body.phonenumber
            const userEmail = req.body.email
            const regexEmail = new RegExp(userEmail, 'i')
            const exist = await user.find({ email: regexEmail })
            const datalength = exist.length
            if (datalength === 1) {
                res.render('usersignup', { err: "this email is already exist !!" })
                err = null
            } else {
                let number = await user.findOne({ phone: req.body.phonenumber })
                if (number) {
                    number = null
                    console.log(number);
                    res.render('usersignup', { err: "this Phone number  already exist !!" })
                } else {

                    req.session.user = req.body
                    const phone = req.body.phonenumber
                    console.log("thisssss isss else");
                    const otpResponse = await client.verify.v2
                        .services(serviceSid)
                        .verifications.create({
                            to: `+91${phone}`,
                            channel: 'sms'
                        })
                    res.render('otp/send_otp')
                }
            }
        } catch (error) {
            console.log(error.message);
            if (error.code == 11000) {
                res.render('usersignup', { err: "this phone number  already exist !!!!" })
                err = null
            }
        }
    },



    guest: async (req, res) => {
        try {
            console.log("i am guest user !!");
            const data = await product.find({ unlisted: false })
            const brands = await brand.find()
            const cata = await catagory.find()
            const users = false
            res.render('userhome', { data, brands, cata, users })
            req.session.user = false
        } catch (error) {
            console.log(error.message);
        }

    },
    user_login: async (req, res) => {

        try {
            req.session.guest = true
            console.log("haaai   user_login:");
            console.log(req.session.guest);
            res.render("userlogin")
        } catch (error) {
            console.log(error.message);
        }
    },
    user_signup: async (req, res) => {

        try {
            res.render("usersignup")
        } catch (error) {
            console.log(error.message);
        }


    },
    do_login: async (req, res) => {
        try {
            if (req.body.email == "" || req.body.password == "") {
                res.render('userlogin', { message: "All Fields Are Required !!" })
            } else {
                console.log("email problemm !!");
                console.log(req.body.email);
                const data = await user.findOne({ email: req.body.email })
                if (data) {
                    if (data.block == true) {
                        res.render('userlogin', { message: "admin blocked this user" })
                    } else {
                        bcrypt.compare(req.body.password, data.password).then(async(result) => {
                            if (result) {
                                req.session.email = req.body.email
                                req.session.user = true
                               const dt =  await user.findOne({email:req.body.email})
                               req.session.userBody = dt
                                res.redirect('/userhome')
                            } else {
                                res.render('userlogin', { message: "You Entered Wrong Password" })
                            }
                        })
                    }
                } else {
                    res.render('userlogin', { message: "You Entered Wrong Email" })
                }
            }
        } catch (error) {
            console.log(error.message);
        }
    },
    user_home: async (req, res) => {
        try {
            
            const users = true
            const data = await product.find({ unlisted: false })
            const brands = await brand.find()
            const cata = await catagory.find({ unlisted: false })
            const banner = await banners.find()
            const userData = await user.findOne({ email: req.session.email })
            res.render('userhome', { data, brands, cata, users, banner, userData })
        } catch (error) {
            console.log(error.message);
        }
    },


    user_logout: (req, res) => {
        try {
            req.session.user = null
            req.session.email = null
            req.session.userBody = null

            res.redirect("/user_login")
        } catch (error) {
            console.log(error.message);
        }
    },
    view_detail: async (req, res) => {
        try {
            const singleproduct = await product.find({ _id: req.params.id ,unlisted:false}).populate('catagory').exec()
            const categoryData = await catagory.find()
            const users = true
            res.render('products/view-detail', { singleproduct, categoryData, users })
        } catch (error) {
            console.log(error.message);
        }

    },
    catagory: async (req, res) => {
        try {
            console.log(req.params.id);
            const data = await product.find({ catagory: req.params.id, unlisted: false }).populate('catagory').exec()
            console.log(data);
            if (data) {
                res.render('catagory/catagory', { data ,users:true})
            } else {
                const cata = req.params.id
                res.render('catagory/catanull', { cata ,users:true})
            }

        } catch (error) {
            console.log(error.message);
        }

    },
    sort_catagory: async (req, res) => {
        try {
            const data = await product.find({ unlisted: false, catagory: req.params.id })
            console.log(typeof data);
            const cata = await catagory.find()
            res.render('shop', { data, cata })
        } catch (error) {
            console.log(error.message)
        }

    },
    brands: async (req, res) => {
        try {
            const brandName = await brands.findOne({_id:req.params.brandId})
            const brand = await product.find({ brand: req.params.brandId })
            console.log("brand:");
            console.log(brand);
            if (brand) {
                res.render('brand/brand', { brand ,brandName:brandName.name,users:true})
            } else {
                const cata = req.params.brand
                res.render('catagory/catanull', { cata })
            }

        } catch (error) {
            console.log(error.message);
        }

    },
    user_notfound: async (req, res) => {
        try {
            req.session.user = null
        } catch (error) {
          console.log(error.message);
        }
    },


    shop: async (req, res) => {

        try {

            const count = await product.find().countDocuments().exec()
            const totalPages = Math.ceil(count / pageSize)
            const page = parseInt(req.query.page) || 1
            const data = await getProducts(page)
            const cata = await catagory.find({ unlisted: false })
            res.render('shop', { data, cata, page, totalPages ,users:true})
        } catch (error) {
            console.log(error.message)
        }
    },
    verifyotps: async (req, res) => {
        try {
          res.render('otp/send_otp')
        } catch (error) {
          console.log(error.message);
        }
    },
    lowtohigh: async (req, res) => {
        try {
          const data = await product.find().sort({ price: 1 })
        const cata = await catagory.find()
        res.render('shop', { data, cata })
        } catch (error) {
          console.log(error.message);
        }
    },
    hightolow: async (req, res) => {
        try {
        const data = await product.find().sort({ price: -1 })
        const cata = await catagory.find()
        res.render('shop', { data, cata })       
        } catch (error) {
          console.log(error.message);
        }
    },
    search_product: async (req, res) => {
        try {
        const search = req.body.search
        const ss = new RegExp(search, 'i')
        const data = await product.find({ productname: ss })
        const cata = await catagory.find()
        res.render('shop', { data, cata ,search:search})        
        } catch (error) {
          console.log(error.message);
        }
    },
    search_product_page: async (req, res) => {
        res.redirect('/shop')
    },
    forget_load: async (req, res) => {
        try {
            res.render('forgot')
        } catch (error) {
            console.log(error.message);
        }
    },
    forget_verify: async (req, res) => {
        try {
            const phone = req.body.phonenumber
            const otpResponse = await client.verify.v2
                .services(serviceSid)
                .verifications.create({
                    to: `+91${phone}`,
                    channel: 'sms'
                })



        } catch (error) {
            console.log(error.message);
        }
    },
    verifyforgotOTP: async (req, res, next) => {
        const phone = req.session.phones
        const otp = req.body.otp
        const userData = req.session.user
        try {
            console.log("service otp not serviceddddd");
            const verifiedResponse = await client.verify._v2
                .services(serviceSid)
                .verificationChecks.create({
                    to: `+91${phone}`,
                    code: otp,
                }).then(async (verificationResponse) => {
                    console.log("verification response:");
                    console.log(verificationResponse);
                    console.log("verification response status:");
                    console.log(verificationResponse.status);
                    if (verificationResponse.status === 'approved') {
                        res.render('forgot/newpassword')
                    } else {
                        res.render('forgot/forgot_otp', { err: 'wrong otp you have entered' })
                    }
                })
        } catch (error) {
            console.log(error.message);
        }
    },
    sendresendOTP: async (req, res) => {
        console.log("reached send otp");
        try {
            const phone = req.session.phnumber
            console.log(phone);
            console.log("thisssss isss else 223224");
            const otpResponse = await client.verify.v2
                .services(serviceSid)
                .verifications.create({
                    to: `+91${phone}`,
                    channel: 'sms'
                })
            res.render('otp/send_otp')




        } catch (error) {
            console.log(error.message);
        }
    },
    sendresendOTP_load: async (req, res) => {
        try {
            console.log("the otp page reloaded");
            res.render('otp/send_otp')
        } catch (error) {
          console.log(error.message);
        }
    },
    forget_otp_load: async (req, res) => {
        try {
            const exist = await user.findOne({ phone: req.body.phonenumber })
            if (exist) {
                console.log(req.body.phonenumber);
                req.session.phones = req.body.phonenumber
    
                req.session.user = req.body
                const phone = req.body.phonenumber
                console.log("thisssss isss forgot otp senddddd");
                const otpResponse = await client.verify.v2
                    .services(serviceSid)
                    .verifications.create({
                        to: `+91${phone}`,
                        channel: 'sms'
                    })
    
                res.render('forgot/forgot_otp')
    
            } else {
                console.log("wrong phone number entered");
                res.render('forgot', { message: "this mobile not exist !!" })
            }        
        } catch (error) {
          console.log(error.message);
        }
    },
    save_new_password: async (req, res) => {
        try {
            const encpass = await bcrypt.hash(req.body.newpassword, 10)
            const result = await user.updateOne({ phone: req.session.phones }, { $set: { password: encpass } })
            req.session.user = true
            res.redirect("/userhome")
            } catch (error) {
          console.log(error.message);
        }

    },
    user_profile: async (req,res)=>{
        try {
            const data =  await user.findOne({email:req.session.email})
            res.render('profile/user-profile',{data})
        } catch (error) {
            console.log(error.message);
        }
    },

    do_edit_profile: async (req,res)=>{

        try {
        await user.updateOne({email:req.session.email},{$set:{
        username:req.body.username,
        email:req.body.email,
        phone:req.body.phone
        }})
        req.session.email = req.body.email
        res.redirect('/user-profile')
        } catch (error) {
        if(error.code == 11000){
        console.log("chacheeeeshh");
        const data = await user.findOne({email:req.session.email})
        res.render('profile/user-profile',{data,err:"this email is already in use !!"})
        }
        }
    },
    add_new_address: async (req,res)=>{
        try {
          
                     await user.updateOne({email:req.session.email},{$push:
                        {address:
                          {name:req.body.name,
                           street:req.body.street,
                           district:req.body.district,
                           state:req.body.state,
                           pincode:req.body.pincode,
                           country:req.body.country,
                           phone:req.body.phone
                        }
                        }} )


                console.log("address added");
                res.redirect('/user-profile')
          
       
        } catch (error) {
            console.log(error.message);
        }
    },
    edit_address: async (req,res)=>{
        try {
            await user.updateOne({email:req.session.email,"address._id":req.params.id},{$set:{
                "address.$": req.body

            }
            })
            
            res.redirect("/user-profile")
        } catch (error) {
            console.log(error.message);
        }
    },
    delete_address: async (req,res)=>{
        try {
            console.log(req.params.id);
            await user.updateOne({email:req.session.email},{
                $pull:{
                    address:{_id:req.params.id}
                }
            }).then(()=>{
                console.log("deleteeedd");
              res.redirect("/user-profile")    
            })
          
        } catch (error) {
           console.log(error.message);
        }
    },
    show_checkout: async (req,res)=>{
        try {

            const data = await user.findOne({email:req.session.email}).populate('cart.productId').exec()
           console.log(data.cart);
           var rr = 0
           for(var i=0; i<data.cart.length ; i++){
            if(data.cart[i].productId.quantity <= 0){
        const cartData=await user.findOne({email:req.session.email}).populate('cart.productId').exec()
            
                res.render('cart/cart',{cartData,message:"remove outof stock item from the cart",users:true}) 
             
            }else{
               rr = rr+1
            }
           }
           console.log(rr);
           if(rr == data.cart.length ){
            res.render('cart/checkout',{data})

           }
        } catch (error) {
         console.log(error.message);   
        }
    },
    Add_address_checkout: async (req,res)=>{
        try {
          await user.updateOne({email:req.session.email},{$push:
                {address:
                  {name:req.body.name,
                   street:req.body.street,
                   district:req.body.district,
                   state:req.body.state,
                   pincode:req.body.pincode,
                   country:req.body.country,
                   phone:req.body.phone
                }
                }} )
     console.log("addeddd address:");
   

 
        console.log("address added from check out");
        res.json({ success: true})
  
        } catch (error) {
                console.log(error.message);
        }
    
    },
    apply_coupon: async (req,res)=>{
        try {
         const code = req.body.code
         const coupons =  await coupon.findOne({code:code})
         if(coupons){
            let couponUsed = await coupon.findOne({ code: code, used: { $in: [req.session.email] } });

            // let couponUsed = await coupon.findOne({code:code},{used:{$in:req.session.email}})

            if(couponUsed){
                couponUsed = null
                console.log("coupon used");

                res.json({ success: true,message:"this coupon alreAdy used !!"})
            }else{

                if(coupons.date < Date.now()){
                    console.log("coupon expiredddd");
    
                    res.json({ success: true,message:"this coupon Expired !!"})
                }else{
    
                    console.log("coupon valid");
                   
                     const data = await user.findOne({email:req.session.email}).populate('cart.productId').exec()
                     const per = (data.cartTotalPrice * coupons.discountpercentage)/100
                     if(per > coupons.maxdiscountprice){
                        const tprice = data.cartTotalPrice - coupons.maxdiscountprice
                     console.log("tprice :"+tprice);
                     res.json({ success: true,message:"the coupon limit price is :"+coupons.maxdiscountprice,coupondata:coupons,user:data,tprice})
    
    
                     }else{
                        const tprice = data.cartTotalPrice - per
                        console.log("tprice :"+tprice);
                     res.json({ success: true,message:"",coupondata:coupons,user:data,tprice})
    
       
                     }
            }
           
            }
         }else{
            console.log("coupon not valid");

            res.json({ success: true,message:"this coupon is not valid !!"})
         }
       
        } catch (error) {
            console.log(error.message);
        }
    },
    after_checkout: async (req,res)=>{
        try {

            const products = req.body
            console.log(req.body);
            const code = products.cop_code
            await couponModel.updateOne({code:code},{$addToSet:{used:req.session.email}})
           const coupon = await couponModel.findOne({code:code})

            //  for(var i = 0 ; i< products.product.length ; i++ ){

            //     const productsdata = await product.findById(products.product[i].productId)
             
            //  }


           
            if(products.paymentMethod == "COD"){
                products.status = "pending"
            }else if (products.paymentMethod == "UPI"){
                products.status = "payment failed"
            }
           
            if (!Array.isArray(products.productId)) {
                console.log("not arraayyayaya");
                products.productId = [products.productId]
               
              }
              if(!Array.isArray(products.qty)){
                products.qty = [products.qty]
              }
              if(!Array.isArray(req.body.productTotalPrice)){
                products.productTotalPrice = [products.productTotalPrice]
                
              }
            const productDetails = []
          for(var i=0; i< products.productId.length ;i++ ){
            productDetails.push({
                 productId: products.productId[i],
                qty: products.qty[i],
                productTotalPrice: products.productTotalPrice[i]
            })
          }

   console.log("------");
           console.log(products);
// Get current date
const today = new Date();

// // Subtract one day
// const yesterday = new Date(today);
// yesterday.setDate(today.getDate() - 3);

     

             const order = new orderModel({
                userId:products.userId,
                address:products.address,
                product:productDetails,
                cartTotalPrice: products.cartTotalPrice,
                SubTotal: products.SubTotal,
                coupon:coupon,
                paymentMethod: products.paymentMethod,
                status: products.status,
                date:today,
                orderId: `${uuidv4()}`

             })
            await order.save()
          

            await user.updateOne({email:req.session.email},{$pull:{cart:{productId:{$in:products.productId}} }})
            await user.updateOne({email:req.session.email},{$set:{cartTotalPrice:0}})
             

            if(products.paymentMethod == "COD"){
                 console.log(productDetails);
                const productdatas  = await product.findOne({_id:products.productId})
                console.log("productdatas.quantity :"+productdatas.quantity);
                console.log("products.qty : "+products.qty);

                for(var i = 0; i< productDetails.length ; i++){
                    const prod = await product.findById(productDetails[i].productId)
                    prod.quantity -= productDetails[i].qty
                    await prod.save()
                }
                
               res.json({success:true})
            }else {
                const orderDetails = await orderModel.findOne({}).sort({date:-1}).lean()
                console.log("day :" + orderDetails);
             var options = {
                amount:products.cartTotalPrice * 100,
                currency: 'INR',
                receipt: ""+orderDetails._id
             }
             for(var i = 0; i< productDetails.length ; i++){
                const pro = await product.findById(productDetails[i].productId)
                pro.quantity -= productDetails[i].qty
                pro.status = "shipped"
                await pro.save()
            }
             instance.orders.create(options, function (err, order) {
                 console.log("New order "+order);
               
                 res.json({Razorpay:true,order}) 
             })
            }


         
        } catch (error) {
            console.log(error.message);
        }
    },
    orderlist: async (req,res)=>{
        try {
             const users = await user.findOne({email:req.session.email})
            const order = await orderModel.find({userId:users._id}).populate("product.productId").sort({date:-1}).exec()
           
            res.render('order/orderlist',{order,userdatas:users,moment:moment,users:true})
        } catch (error) {
            console.log(error.message);
        }
    },
    order_succcess: async (req,res)=>{
        try {
            const order = await orderModel.findOne().sort({date:-1})
            res.render('order/success',{order})

        } catch (error) {
            console.log(error.message);
        }
    },
    vew_order: async (req,res)=>{
        try {
            const data =  await orderModel
            .findOne({_id:req.params.id})
            .populate("userId")
            .populate("product.productId").exec()

        
            if(data.coupon == null){
                res.render('order/view-order',{data,users:true,coupon:false,moment:moment})
                
            }else{
                 res.render('order/view-order',{data,users:true,coupon:true,moment:moment})
            }
           
        } catch (error) {
          console.log(error.message);  
        }
    },
    order_cancel: async (req,res)=>{
        try {
            console.log(req.params.id);
            const id = req.params.id
            const st = ""+id
            console.log(typeof st);
            const status = req.params.status
           
          await  orderModel.updateOne({orderId:st },{$set:{status:req.params.status}}).then(()=>{
                console.log("djhs");

               res.json({success:status})
            })
        } catch (error) {
           console.log(error.message); 
        }
    }
    ,
    online_payment: async (req,res)=>{
        try {
     console.log("reached online payment");
      console.log(req.body);
      const latestOrder = await orderModel
      .findOne({})
      .sort({ date: -1 })
      .lean();
      console.log("latest order");
      console.log(latestOrder);
const change=await orderModel.updateOne({_id: latestOrder._id},{$set:{status:"pending"}})
          const details = req.body
            let hmac=crypto.createHmac('sha256',process.env.KEY_SECRET)
          hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
          hmac=hmac.digest('hex')
          if(hmac==details['payment[razorpay_signature]']){
            console.log("success");
            const latestOrder = await orderModel
            .findOne({})
            .sort({ date: -1 })
            .lean();
            console.log(latestOrder);
      const change=await orderModel.updateOne({_id: latestOrder._id},{$set:{status:"pending"}})

      res.json({status:true})
          }else{
            console.log("Fail");
res.json({failed:true})
          }
   






            // res.redirect('/ordersuccess')
        } catch (error) {
           console.log(error.message); 
        }
    }
   
}