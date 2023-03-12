
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
    banner: async (req,res)=>{
        try {
            const data = await banners.find()
           res.render('users/banner',{data})  
        } catch (error) {
            console.log(error);
        }
       
    },
    addBanner: async (req,res)=>{
        try {
              res.render('users/add-banner')
        } catch (error) {
            console.log(error);
        }
      
    },
    banner_save: async (req,res)=>{
        try {
           const data = new banners({
            title:req.body.title,
            image:req.file.filename
        })
      const result =  await data.save()
          if(result){
            console.log("saved");
             res.redirect('/admin/banner')
          }else{
            console.log('problem in banner save');
          }
            
            
        } catch (error) {
            console.log(error);
        }
       
      
    },
    delete_banner: async (req,res)=>{
        try {
        fs.unlink(path.join('/banner-img'+req.params.id),()=>{})
        await banners.deleteOne({_id:req.params.id})
        res.json({success:true})      
        } catch (error) {
          console.log(error.message);
        }  
    },
    edit_banner: async (req,res)=>{
        try {
        const data = await banners.findOne({_id:req.params.id})
        res.render('users/edit-banner',{data})        
        } catch (error) {
          console.log(error.message);
        }
    },
    do_edit_banner : async (req,res)=>{
     try {
        await banners.updateOne({_id:req.params.id},{$set:{
            title:req.body.title
        }})
        res.redirect('/admin/banner')
     } catch (error) {
        console.log(error.message);
     }
    },
    delete_image: async (req,res)=>{
        try {
         fs.unlink(path.join('/banner-img'+req.params.id),()=>{})
         await banners.updateOne({_id:req.params.obj},{$unset:{image:req.params.id}})
         res.redirect('/admin/edit-banner/'+req.params.obj)       
        } catch (error) {
          console.log(error.message);
        }
    },
    edit_cata_img: async (req,res)=>{
        try {
        fs.unlink(path.join('/catagory-img',req.params.imgid),()=>{})
        await catagory.updateOne({_id:req.params.proid},{$unset:{image:req.params.imgid}})
        res.redirect('/admin/edit-category/'+req.params.proid)       
        } catch (error) {
          console.log(error.message);
        }

    },
    show_coupons: async (req,res)=>{
        try {
          const data = await couponModel.find()
            res.render('coupon/couponlist',{data,moment:moment})
            
        } catch (error) {
            console.log(error.message);
        }
    },
    add_coupon: async (req,res)=>{
     try {

      const  {
        couponName,
        description,
        maxprice,
        discountpercentage,
        date,
        code
    
    } = req.body

        const reg =  RegExp(code,'i')
        const exist = await couponModel.findOne({code:reg})
        console.log(exist);
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
   

     } catch (error) {
        console.log(error.message);
     }
    },
    del_coupon: async (req,res)=>{
        await couponModel.deleteOne({_id:req.params.id})
       res.json({success:true})
    },
    edit_coupon_page: async (req,res)=>{
        try {
            const data = await couponModel.findOne({_id:req.params.id})
            res.render('coupon/edit-coupon',{data,moment:moment})
        } catch (error) {
            console.log(error.message);
        }
    },
    do_edit_coupon: async (req,res)=>{
        try {
            console.log("dfffd");
            console.log(req.body.dates);
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

        } catch (error) {
            console.log(error.message);
        }
    },
    edit_banner_img: async (req,res)=>{
        try {
           await banners.updateOne({_id:req.params.id},{$set:{image:req.file.filename}})
           res.redirect('/admin/edit-banner/'+req.params.id)
        } catch (error) {
            console.log(error.message);
        }
    },
    list_orders: async (req,res)=>{
        try {
            const order = await orderModel.find().populate("product.productId").exec()
            res.render("users/order-list",{order,moment: moment })
        } catch (error) {
            console.log(error.message);
        }
    },
    view_order: async (req,res)=>{
        try {
            const order = await orderModel.findById(req.params.id).populate('product.productId').populate("userId").exec()
           if(order.coupon){
            res.render('users/view-order',{order,coupon:true,moment:moment})
           }else{
            res.render('users/view-order',{order,coupon:false,moment:moment})

           }
            
        } catch (error) {
            console.log(error.message);
        }
    },
    change_status : async (req,res)=>{
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
           console.log(error.message); 
        }
    },
    sales_report: async (req,res)=>{
        try {
            res.render("users/sales-report")
        } catch (error) {
            console.log(error.message);
        }
    },
    sales_reports: async(req,res)=>{
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
 
     

            console.log(from);
            console.log(dd);
          const data=await orderModel.find({status:"delevered", date: {
            $gte:new Date(from),
            $lte:new Date(dd) 
          }}).populate("product.productId")
         console.log(data);
          res.render('users/sales-report',{data,moment:moment})
        } catch (error) {
            console.log(error.message);
        }
    }
    
}