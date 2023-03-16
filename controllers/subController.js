
const banners = require('../models/bannerModel')

const fs = require('fs')
const path = require('path')
const catagory = require('../models/catagory')
const couponModel = require('../models/couponModel')
const orderModel = require('../models/orderModel')
const { populate } = require('../models/bannerModel')

const moment = require ("moment")
const { trusted } = require('mongoose')

module.exports ={
    banner: async (req,res,next)=>{
        try {
            const data = await banners.find()
           res.render('users/banner',{data})  
        } catch (error) {
          next()
        }
       
    },
    addBanner: async (req,res,next)=>{
        try {
              res.render('users/add-banner')
        } catch (error) {
          next()
        }
      
    },
    banner_save: async (req,res,next)=>{
        try {
           const data = new banners({
            title:req.body.title,
            image:req.file.filename
        })
      const result =  await data.save()

             res.redirect('/admin/banner')
                         
        } catch (error) {
          next()
        }
       
      
    },
    delete_banner: async (req,res,next)=>{
        try {
        fs.unlink(path.join('/banner-img'+req.params.id),()=>{})
        await banners.deleteOne({_id:req.params.id})
        res.json({success:true})      
        } catch (error) {
            res.render("admin_error")


        }  
    },
    edit_banner: async (req,res,next)=>{
        try {
        const data = await banners.findOne({_id:req.params.id})
        res.render('users/edit-banner',{data})        
        } catch (error) {
            res.render("admin_error")


        }
    },
    do_edit_banner : async (req,res,next)=>{
     try {
        await banners.updateOne({_id:req.params.id},{$set:{
            title:req.body.title
        }})
        res.redirect('/admin/banner')
     } catch (error) {
        res.render("admin_error")

     }
    },
    delete_image: async (req,res,next)=>{
        try {
         fs.unlink(path.join('/banner-img'+req.params.id),()=>{})
         await banners.updateOne({_id:req.params.obj},{$unset:{image:req.params.id}})
         res.redirect('/admin/edit-banner/'+req.params.obj)       
        } catch (error) {
        next()
        }
    },
    delete_cata_img: async (req,res,next)=>{
        try {
        fs.unlink(path.join('/catagory-img',req.params.imgid),()=>{})
        await catagory.updateOne({_id:req.params.proid},{$unset:{image:req.params.imgid}})
        res.redirect('/admin/edit-category/'+req.params.proid)       
        } catch (error) {
            res.render("admin_error")


        }

    },
    show_coupons: async (req,res,next)=>{
        try {
          let data = await couponModel.find()
     data = data.reverse()
            res.render('coupon/couponlist',{data,moment:moment})
            
        } catch (error) {
          next()
        }
    },
    add_coupon: async (req,res,next)=>{
     try {

      let  {
        couponName,
        description,
        maxprice,
        discountpercentage,
        date,
        code
    
    } = req.body
    couponName = couponName.trim()
    description = description.trim()
    maxprice = maxprice.trim()
    discountpercentage = discountpercentage.trim()
    date = date.trim()
    code = code.trim()


    if(
        couponName==""||
        description==""||
        maxprice==""||
        discountpercentage==""||
        date==""||
        code==""
    ){
        const data = await couponModel.find()
        res.render('coupon/couponlist',{data,moment:moment,message:"all feilds are required !!"})

    }else{
       const reg =  RegExp(code,'i')
        const exist = await couponModel.findOne({code:reg})
        if(exist){
         
            const data = await couponModel.find()
            res.render('coupon/couponlist',{data,moment:moment,message:"this coupon code already exist !!"})
           
        }else{
            
            const data = new couponModel({
                coupon_name : couponName,
                description : description,
                maxdiscountprice : maxprice,
                discountpercentage : discountpercentage,
                date : date,
                code : code
          })
            await data.save()
            res.redirect('/admin/coupons')
        } 
    }

        
   

     } catch (error) {
      next()
     }
    },
    del_coupon: async (req,res,next)=>{
        await couponModel.deleteOne({_id:req.params.id})
       res.json({success:true})
    },
    edit_coupon_page: async (req,res,next)=>{
        try {
            const data = await couponModel.findOne({_id:req.params.id})
            res.render('coupon/edit-coupon',{data,moment:moment})
        } catch (error) {
            res.render("admin_error")

        }
    },
    do_edit_coupon: async (req,res,next)=>{
        try {
            let couponName  = req.body.couponName
            let description  = req.body.description
            let maxprice  = req.body.maxprice
            let discountpercentage  = req.body.discountpercentage
            let code  = req.body.code
            let dates  = req.body.dates
            couponName = couponName.trim()
            description = description.trim()
            maxprice = maxprice.trim()
            discountpercentage = discountpercentage.trim()
            code = code.trim()
            dates = dates.trim()

            if(
                couponName==""||
                description==""||
                maxprice==""||
                discountpercentage==""||
                code==""||
                dates==""){

   const data = await couponModel.findOne({_id:req.params.id})
            res.render('coupon/edit-coupon',{data,moment:moment,message:"all feilds are required !!"})
            }else{

                const result =  await couponModel.updateOne({_id:req.params.id},{$set:{
                 coupon_name:req.body.couponName,
                 description:req.body.description,
                 maxdiscountprice: req.body.maxprice,
                 discountpercentage: req.body.discountpercentage,
                 date:req.body.dates,
                 code: req.body.code 
                   }})
                   const id = req.params.id
                       res.redirect('/admin/coupons')
            }
          

        } catch (error) {
            res.render("admin_error")

        }
    },
    edit_banner_img: async (req,res,next)=>{
        try {
           await banners.updateOne({_id:req.params.id},{$set:{image:req.file.filename}})
           res.redirect('/admin/edit-banner/'+req.params.id)
        } catch (error) {
          next()
        }
    },
    list_orders: async (req,res,next)=>{
        try {
            const order = await orderModel.find().populate("product.productId").sort({date:-1}).exec()
            res.render("users/order-list",{order,moment: moment })
            
        } catch (error) {
          next()
        }
    },
    view_order: async (req,res,next)=>{
        try {
            const order = await orderModel.findById(req.params.id).populate('product.productId').populate("userId").exec()
           if(order.coupon){
            res.render('users/view-order',{order,coupon:true,moment:moment})
           }else{
            res.render('users/view-order',{order,coupon:false,moment:moment})

           }
            
        } catch (error) {
            res.render("admin_error")

        }
    },
    change_status : async (req,res,next)=>{
        try {

            const order = await orderModel.findById(req.body.orderId)
            if(order.status !== "return" && order.status !=="canceled"){
                 if(req.body.status == "pending" & order.status == "delevered" 
             || req.body.status == "pending" & order.status == "confirmed" 
             || req.body.status == "confirmed" & order.status == "delevered"){

                res.json({success:true,status:req.body.status}) 
            }else{
              await orderModel.updateOne({_id:req.body.orderId},{$set:{status:req.body.status}})
            res.json({success:true,status:req.body.status})  
            }
            
           
            }
        } catch (error) {
         next() 
        }
    },
    sales_report: async (req,res,next)=>{
        try {
            res.render("users/sales-report")
        } catch (error) {
          next()
        }
    },
    sales_reports: async(req,res,next)=>{
        try {
         
            const {
                from,
                to
            } = req.body

        // create a new date object with the existing date
        const existingDate = new Date(to);

        // add one day to the existing date
        const newDate = new Date(existingDate);
        newDate.setDate(existingDate.getDate() + 1);

        // log the new date in a specific format (e.g. YYYY-MM-DD)
        const dd = newDate.toISOString().slice(0,10)// output: 2023-03-11
 
            const data=await orderModel.find({status:"delevered", date: {
            $gte:new Date(from),
            $lte:new Date(dd) 
          }}).populate("product.productId")
          res.render('users/sales-report',{data,moment:moment,print:true})
        } catch (error) {
          next()
        }
    }
    
}