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


const pageSize = 8


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

                            res.redirect("/userhome")

                        } else {
                            res.render('otp/send_otp')
                        }
                    } else {
                        res.render('otp/send_otp', { err: 'wrong otp you have entered' })
                    }
                })
        } catch (error) {
            next()
        }
    },


    sendOTP: async (req, res, next) => {
    
        
        try {
            if(
                req.body.username == ""||
                req.body.email == ""||
                req.body.phonenumber == ""||
                req.body.password == ""
                ){
                    res.render('usersignup', { err: "All feilds are required !!" })
  
                }else{

                
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
                  
                    res.render('usersignup', { err: "this Phone number  already exist !!" })
                } else {

                    req.session.user = req.body
                    const phone = req.body.phonenumber
                    const otpResponse = await client.verify.v2
                        .services(serviceSid)
                        .verifications.create({
                            to: `+91${phone}`,
                            channel: 'sms'
                        })
                    res.render('otp/send_otp')
                }
            }
        }
        } catch (error) {
            next()
            if (error.code == 11000) {
                res.render('usersignup', { err: "this phone number  already exist !!!!" })
                err = null
            }
        }
    },



    guest: async (req, res, next) => {
        try {
            const data = await product.find({ unlisted: false })
            const brands = await brand.find()
            const cata = await catagory.find()
            const users = false
            res.render('userhome', { data, brands, cata, users })
            req.session.user = false
        } catch (error) {
            next()
        }

    },
    user_login: async (req, res, next) => {

        try {
            req.session.guest = true
            res.render("userlogin")
        } catch (error) {
            next()
        }
    },
    user_signup: async (req, res, next) => {

        try {
            res.render("usersignup")
        } catch (error) {
            next()
        }


    },
    do_login: async (req, res, next) => {
        try {
            if (req.body.email == "" || req.body.password == "") {
                res.render('userlogin', { message: "All Fields Are Required !!" })
            } else {
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
            next()
        }
    },
    user_home: async (req, res,next) => {
        try {
            
            const users = true
            const data = await product.find({ unlisted: false })
            const brands = await brand.find()
            const cata = await catagory.find({ unlisted: false })
            const banner = await banners.find()
            const userData = await user.findOne({ email: req.session.email })
            res.render('userhome', { data, brands, cata, users, banner, userData })
        } catch (error) {
           next()
        }
    },


    user_logout: (req, res, next) => {
        try {
            req.session.user = null
            req.session.email = null
            req.session.userBody = null

            res.redirect("/user_login")
        } catch (error) {
            next()
        }
    },
    view_detail: async (req, res, next) => {
        try {
         
                 const singleproduct = await product.find({ _id: req.params.id ,unlisted:false}).populate('catagory').populate("brand").exec()
            const categoryData = await catagory.find()
            if(req.session.user){
         
            res.render('products/view-detail', { singleproduct, categoryData, users:true })
            }else{
                res.render('products/view-detail', { singleproduct, categoryData, users:false })

            }
           
        } catch (error) {
            res.render("user_error")

        }

    },
    catagory: async (req, res, next) => {
        try {
            const data = await product.find({ catagory: req.params.id, unlisted: false }).populate('catagory').exec()
            if (data) {
                res.render('catagory/catagory', { data ,users:true})
            } else {
                const cata = req.params.id
                res.render('catagory/catanull', { cata ,users:true})
            }

        } catch (error) {
            res.render("user_error")

        }

    },
    sort_catagory: async (req, res, next) => {
        try {
            if(req.params.search !== "null"){
                const search = req.params.search
                const ss = new RegExp(search, 'i')
                const data = await product.find({ productname: ss , unlisted: false, catagory: req.params.id })
            const cata = await catagory.find()
            res.render('shop', { data, cata ,search:search,cataId:req.params.id})
            }else{
                 const data = await product.find({ unlisted: false, catagory: req.params.id })
            const cata = await catagory.find()
            res.render('shop', { data, cata ,cataId:req.params.id})
            }
            
        } catch (error) {
            res.render("user_error")

        }

    },
    brands: async (req, res, next) => {
        try {
            const brandName = await brands.findOne({_id:req.params.brandId})
            const brand = await product.find({ brand: req.params.brandId })
            if (brand) {
                res.render('brand/brand', { brand ,brandName:brandName.name,users:true})
            } else {
                const cata = req.params.brand
                res.render('catagory/catanull', { cata })
            }

        } catch (error) {
            res.render("user_error")

        }

    },
    user_notfound: async (req, res, next) => {
        try {
            req.session.user = null
        } catch (error) {
          next()
        }
    },


    shop: async (req, res, next) => {

        try {

            const count = await product.find().countDocuments().exec()
            const totalPages = Math.ceil(count / pageSize)
            const page = parseInt(req.query.page) || 1
            const data = await getProducts(page)
            const cata = await catagory.find({ unlisted: false })
            res.render('shop', { data, cata, page, totalPages ,users:true})
        } catch (error) {
            next()
        }
    },
    verifyotps: async (req, res, next) => {
        try {
          res.render('otp/send_otp')
        } catch (error) {
          next()
        }
    },
    lowtohigh: async (req, res, next) => {
        try {
            if( req.query.cataId == undefined  && typeof req.query.search !== undefined){
                const search = req.query.search
                 const ss = new RegExp(search, 'i')
                const data = await product.find({ productname: ss }).sort({ price: 1 })
                const cata = await catagory.find()
                res.render('shop', { data, cata ,search:search}) 
            }else if(req.query.cataId  && typeof req.query.search == undefined){
                const data = await product.find({catagory:req.query.cataId}).sort({ price: 1 })
                const cata = await catagory.find()
                res.render('shop', { data, cata ,sort:1,cataId:req.query.cataId}) 
            }else if(typeof req.query.cataId !== undefined && typeof req.query.search !== undefined){
                const search = req.query.search
                const ss = new RegExp(search, 'i')
                const data = await product.find({productname: ss ,catagory:req.query.cataId}).sort({ price: 1 })
                const cata = await catagory.find()
                res.render('shop', { data, cata ,sort:1,cataId:req.query.cataId,search:search}) 
            }else{
                const data = await product.find().sort({ price: 1 })
        const cata = await catagory.find()
        res.render('shop', { data, cata ,sort:1}) 
            }
         
        } catch (error) {
          next()
        }
    },
    hightolow: async (req, res, next) => {
        try {
          if(typeof req.query.search !== undefined &&  req.query.cataId == undefined){

            const search = req.query.search
           const ss = new RegExp(search, 'i')
            const data = await product.find({ productname: ss }).sort({ price: -1 })
            const cata = await catagory.find()
            res.render('shop', { data, cata ,search:search})   
          }else if(req.query.cataId  && typeof req.query.search == undefined){
            const data = await product.find({catagory:req.query.cataId}).sort({ price: -1 })
            const cata = await catagory.find()
            res.render('shop', { data, cata ,sort:-1,cataId:req.query.cataId}) 
        
          }else if(typeof req.query.cataId !== undefined && typeof req.query.search !== undefined){
                const search = req.query.search
                const ss = new RegExp(search, 'i')
            const data = await product.find({productname: ss ,catagory:req.query.cataId}).sort({ price: -1 })
            const cata = await catagory.find()
            res.render('shop', { data, cata ,sort:-1,cataId:req.query.cataId,search:search})  
        
        }else {
        const data = await product.find().sort({ price: -1 })
        const cata = await catagory.find()
        res.render('shop', { data, cata ,sort:-1})   
          } 
         
        } catch (error) {
          next()
        }
    },
    search_product: async (req, res, next) => {
        try {
            var cataId = req.query.sort; 
            
            if(req.query.cataId){
                const search = req.body.search
                const ss = new RegExp(search, 'i')
                const data = await product.find({ productname: ss ,catagory:req.query.cataId})
                const cata = await catagory.find()
                res.render('shop', { data, cata ,search:search,cataId:req.query.cataId})  
            }else if (req.query.sort) {
                const search = req.body.search
                const ss = new RegExp(search, 'i')
                const data = await product.find({ productname: ss }).sort({price:req.query.sort})
                const cata = await catagory.find()
                res.render('shop', { data, cata ,search:search,sort:req.query.sort}) 
            }else if(req.query.cataId && req.body.search){
                const search = req.body.search
                const ss = new RegExp(search, 'i')
                const data = await product.find({ productname: ss })
                const cata = await catagory.find()
                res.render('shop', { data, cata ,search:search,cataId:req.query.cataId})   
            }else{

                const search = req.body.search
                const ss = new RegExp(search, 'i')
                const data = await product.find({ productname: ss })
                const cata = await catagory.find()
                res.render('shop', { data, cata ,search:search})        
            }
        } catch (error) {
          next()
        }
    },
    search_product_page: async (req, res, next) => {
        res.redirect('/shop')
    },
    forget_load: async (req, res, next) => {
        try {
            res.render('forgot')
        } catch (error) {
            next()
        }
    },
    forget_verify: async (req, res, next) => {
        try {
            const phone = req.body.phonenumber
            const otpResponse = await client.verify.v2
                .services(serviceSid)
                .verifications.create({
                    to: `+91${phone}`,
                    channel: 'sms'
                })



        } catch (error) {
            next()
        }
    },
    verifyforgotOTP: async (req, res, next) => {
        const phone = req.session.phones
        const otp = req.body.otp
        const userData = req.session.user
        try {
            const verifiedResponse = await client.verify._v2
                .services(serviceSid)
                .verificationChecks.create({
                    to: `+91${phone}`,
                    code: otp,
                }).then(async (verificationResponse) => {
                    if (verificationResponse.status === 'approved') {
                        res.render('forgot/newpassword')
                    } else {
                        res.render('forgot/forgot_otp', { err: 'wrong otp you have entered' })
                    }
                })
        } catch (error) {
            next()
        }
    },
    sendresendOTP: async (req, res, next) => {
        try {
            const phone = req.session.phnumber
            const otpResponse = await client.verify.v2
                .services(serviceSid)
                .verifications.create({
                    to: `+91${phone}`,
                    channel: 'sms'
                })
            res.render('otp/send_otp')




        } catch (error) {
            next()
        }
    },
    sendresendOTP_load: async (req, res, next) => {
        try {
            res.render('otp/send_otp')
        } catch (error) {
          next()
        }
    },
    forget_otp_load: async (req, res, next) => {
        try {
            const exist = await user.findOne({ phone: req.body.phonenumber })
            if (exist) {
                req.session.phones = req.body.phonenumber
    
                req.session.user = req.body
                const phone = req.body.phonenumber
                const otpResponse = await client.verify.v2
                    .services(serviceSid)
                    .verifications.create({
                        to: `+91${phone}`,
                        channel: 'sms'
                    })
    
                res.render('forgot/forgot_otp')
    
            } else {
                res.render('forgot', { message: "this mobile not exist !!" })
            }        
        } catch (error) {
          next()
        }
    },
    save_new_password: async (req, res, next) => {
        try {
            const encpass = await bcrypt.hash(req.body.newpassword, 10)
            const result = await user.updateOne({ phone: req.session.phones }, { $set: { password: encpass } })
            req.session.user = true
            res.redirect("/userhome")
            } catch (error) {
          next()
        }

    },
    user_profile: async (req,res,next)=>{
        try {
            const data =  await user.findOne({email:req.session.email})
            res.render('profile/user-profile',{data,users:true})
        } catch (error) {
            next()
        }
    },

    do_edit_profile: async (req,res,next)=>{

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
        const data = await user.findOne({email:req.session.email})
        res.render('profile/user-profile',{data,err:"this email is already in use !!"})
        }
        }
    },
    change_password: async (req,res,next)=>{
    try {
    let old =  req.body.oldPass
    const newPass = req.body.newPass
    if(
        old == ""||
        newPass ==""
    ){
        const data = await user.findOne({email:req.session.email})
        res.render('profile/user-profile',{data,err:"all feilds are required !!"})

    }else{
      
       const exist = await user.findOne({email:req.session.email})
       
     await bcrypt.compare(old,exist.password).then(async(result)=>{
        if(result){
           const  bcp = await bcrypt.hash(newPass,10)
           await user.updateOne({email:req.session.email},{$set:{password:bcp}})
           const data = await user.findOne({email:req.session.email})
           res.render('profile/user-profile',{data})
                
        }else{
            const data = await user.findOne({email:req.session.email})
            res.render('profile/user-profile',{data,err:"you entered a wrong password !!"})

        }
  
     })
    }
        // old = await bcrypt.hash(old,10)


    // if(newPass !== conf){
    //     const data =  await user.findOne({email:req.session.email})
    //     res.render('profile/user-profile',{data,err:"old password and "})
    // }


    } catch (error) {
    next()
    }
    },
    add_new_address: async (req,res,next)=>{
        try {
            if(
                req.body.name == ""||
                req.body.street == ""||
                req.body.district == ""||
                req.body.state == ""||
                req.body.country == ""||
                req.body.phone == ""
                
                ){
                    const data =  await user.findOne({email:req.session.email})
                    res.render('profile/user-profile',{data,users:true,err:"all feilds are required !"})
                }else{ 
          
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
                        res.redirect('/user-profile')
                    }


             
          
       
        } catch (error) {
            next()
        }
    },
    edit_address: async (req,res,next)=>{
        try {
            if(
                req.body.name == ""||
                req.body.street == ""||
                req.body.district == ""||
                req.body.state == ""||
                req.body.country == ""||
                req.body.phone == ""
                
                ){
                    const data =  await user.findOne({email:req.session.email})
                    res.render('profile/user-profile',{data,users:true,err:"all feilds are required !"})
                }else{ 
                     await user.updateOne({email:req.session.email,"address._id":req.params.id},{$set:{
                "address.$": req.body

            }
            })}
          
            
            res.redirect("/user-profile")
        } catch (error) {
            res.render("user_error")

        }
    },
    delete_address: async (req,res,next)=>{
        try {
            await user.updateOne({email:req.session.email},{
                $pull:{
                    address:{_id:req.params.id}
                }
            }).then(()=>{
              res.redirect("/user-profile")    
            })
          
        } catch (error) {
            res.render("user_error")

        }
    },
    show_checkout: async (req,res,next)=>{
        try {
        //     const cartData=await user.findOne({email:req.session.email}).populate('cart.productId').exec()
        //   if(cartData.cart.length !== 0){

        //   }
            const data = await user.findOne({email:req.session.email}).populate('cart.productId').exec()
        if(data.cart.length !== 0){
           var rr = 0
           for(var i=0; i<data.cart.length ; i++){
            if(data.cart[i].productId.quantity <= 0){
        const cartData=await user.findOne({email:req.session.email}).populate('cart.productId').exec()
            
                res.render('cart/cart',{cartData,message:"remove outof stock item from the cart",users:true}) 
             
            }else{
               rr = rr+1
            }
           }
           if(rr == data.cart.length ){
            res.render('cart/checkout',{data,users:true})

           }
        }else{
            const cartData=await user.findOne({email:req.session.email}).populate('cart.productId').exec()
            
           
            res.render('cart/cart',{cartData,message:"add items to the cart",users:true}) 

        }
        } catch (error) {
         next()   
        }
    },
    Add_address_checkout: async (req,res,next)=>{
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
   

 
        res.json({ success: true})
  
        } catch (error) {
                next()
        }
    
    },
    apply_coupon: async (req,res,next)=>{
        try {
         const code = req.body.code
         const coupons =  await coupon.findOne({code:code})
         if(coupons){
            let couponUsed = await coupon.findOne({ code: code, used: { $in: [req.session.email] } });

            // let couponUsed = await coupon.findOne({code:code},{used:{$in:req.session.email}})

            if(couponUsed){
                couponUsed = null

                res.json({ success: true,message:"this coupon alreAdy used !!"})
            }else{

                if(coupons.date < Date.now()){
    
                    res.json({ success: true,message:"this coupon Expired !!"})
                }else{
    
                   
                     const data = await user.findOne({email:req.session.email}).populate('cart.productId').exec()
                     const per = (data.cartTotalPrice * coupons.discountpercentage)/100
                     if(per > coupons.maxdiscountprice){
                        const tprice = data.cartTotalPrice - coupons.maxdiscountprice
                     res.json({ success: true,message:"the coupon limit price is :"+coupons.maxdiscountprice,coupondata:coupons,user:data,tprice})
    
    
                     }else{
                        const tprice = data.cartTotalPrice - per
                     res.json({ success: true,message:"",coupondata:coupons,user:data,tprice})
    
       
                     }
            }
           
            }
         }else{
            res.json({ success: true,message:"this coupon is not valid !!"})
         }
       
        } catch (error) {
            next()
        }
    },
    after_checkout: async (req,res,next)=>{
        try {
            const products = req.body
            const users = await user.findOne({email:req.session.email})
           
            if(products.paymentMethod == "COD"){
                products.status = "pending"
            }else if (products.paymentMethod == "UPI"){
                products.status = "payment failed"
            } else if (products.paymentMethod == "WALLET"){

                if(users.wallet < products.cartTotalPrice){
                    res.json({wallet:false})
                    return
                }
                products.status = "pending"
            }
           
            if (!Array.isArray(products.productId)) {
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
          
         async function emptycart (){
            await user.updateOne({email:req.session.email},{$pull:{cart:{productId:{$in:products.productId}} }})
            await user.updateOne({email:req.session.email},{$set:{cartTotalPrice:0}})   
          }

             

            if(products.paymentMethod == "COD"){
                const productdatas  = await product.findOne({_id:products.productId})

                for(var i = 0; i< productDetails.length ; i++){
                    const prod = await product.findById(productDetails[i].productId)
                    prod.quantity -= productDetails[i].qty
                    await prod.save()
                }
                const code = products.cop_code
                await couponModel.updateOne({code:code},{$addToSet:{used:req.session.email}})
               const coupon = await couponModel.findOne({code:code})
               res.json({success:true})
               emptycart()
           
            } else if(products.paymentMethod == "WALLET"){
               
                const productdatas  = await product.findOne({_id:products.productId})

                for(var i = 0; i< productDetails.length ; i++){
                    const prod = await product.findById(productDetails[i].productId)
                    prod.quantity -= productDetails[i].qty
                    await prod.save()
                }
                const userData = await user.findOne({email:req.session.email})
                const walupdate = userData.wallet - products.cartTotalPrice

                await user.updateOne({email:req.session.email},{$set:{wallet:walupdate}})
                const code = products.cop_code
                await couponModel.updateOne({code:code},{$addToSet:{used:req.session.email}})
               const coupon = await couponModel.findOne({code:code})
                emptycart()
               res.json({success:true})
           
            }else {
                const orderDetails = await orderModel.findOne({}).sort({date:-1}).lean()
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
         
             instance.orders.create(options, async function  (err, order) {
            
             
                 res.json({Razorpay:true,order}) 
             })
            }


         
        } catch (error) {
            next()
        }
    },
    orderlist: async (req,res,next)=>{
        try {
             const users = await user.findOne({email:req.session.email})
            const order = await orderModel.find({userId:users._id}).populate("product.productId").sort({date:-1}).exec()
           
            res.render('order/orderlist',{order,userdatas:users,moment:moment,users:true})
        } catch (error) {
            next()
        }
    },
    order_succcess: async (req,res,next)=>{
        try {
            const order = await orderModel.findOne().sort({date:-1})
            res.render('order/success',{order,users:true})

        } catch (error) {
            next()
        }
    },
    vew_order: async (req,res,next)=>{
        try {
            const data =  await orderModel
            .findOne({_id:req.params.id})
            .populate("userId")
            .populate("product.productId").exec()

            const orderDate = new Date(data.date);  // assuming data.date is a valid date string

            const afterSevenDays = new Date(orderDate.getTime() + (3 * 24 * 60 * 60 * 1000));
        // add 7 days (in milliseconds) to the order date timestamp
        
        
        const today = new Date();
   
        

        
            if(data.coupon == null){
    
            if (afterSevenDays > today) {
                res.render('order/view-order',{data,users:true,coupon:false,moment:moment,returns:true})

            }else{
                res.render('order/view-order',{data,users:true,coupon:false,moment:moment})

            }
                
            }else{
              
            if (afterSevenDays > today) {
                res.render('order/view-order',{data,users:true,coupon:true,moment:moment,returns:true})

            }else{
                res.render('order/view-order',{data,users:true,coupon:true,moment:moment})

            }

            }
           
        } catch (error) {
            next()
            res.render("user_error")

        }
    },
    order_cancel: async (req,res,next)=>{
        try {
            const id = req.params.id
            const st = ""+id
            const status = req.params.status
            const order =  await orderModel.findOne({orderId:st})

            if(status == "return" || order.paymentMethod == "UPI" || order.paymentMethod == "WALLET"){
             
              const userData = await user.findOne({email:req.session.email})
              const walupdate = userData.wallet + order.cartTotalPrice

              await user.updateOne({email:req.session.email},{$set:{wallet:walupdate}})
            }
           
          await  orderModel.updateOne({orderId:st },{$set:{status:req.params.status}}).then(()=>{

               res.json({success:status})
            })
        } catch (error) {
            res.render("user_error")

        }
    }
    ,
    online_payment: async (req,res,next)=>{
        try {

      const latestOrder = await orderModel
      .findOne({})
      .sort({ date: -1 })
      .lean();
const change=await orderModel.updateOne({_id: latestOrder._id},{$set:{status:"pending"}})
          const details = req.body
            let hmac=crypto.createHmac('sha256',process.env.KEY_SECRET)
          hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
          hmac=hmac.digest('hex')
          if(hmac==details['payment[razorpay_signature]']){
            const latestOrder = await orderModel
            .findOne({})
            .sort({ date: -1 })
            .lean();
      const change=await orderModel.updateOne({_id: latestOrder._id},{$set:{status:"pending"}})
      
      const code = latestOrder.coupon
      await couponModel.updateOne({code:code},{$addToSet:{used:req.session.email}})
     const coupon = await couponModel.findOne({code:code})
    
     await user.updateOne({email:req.session.email},{$set:{cart:[]}})
     await user.updateOne({email:req.session.email},{$set:{cartTotalPrice:0}})  
             
      res.json({status:true})
          }else{
res.json({failed:true})
          }
   






            // res.redirect('/ordersuccess')
        } catch (error) {
           next() 
        }
    }
   
}