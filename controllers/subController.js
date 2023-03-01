
const banners = require('../models/bannerModel')

const fs = require('fs')
const path = require('path')
const catagory = require('../models/catagory')
const couponModel = require('../models/couponModel')

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
        res.redirect('/admin/banner')        
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
            res.render('coupon/couponlist',{data})
            
        } catch (error) {
            console.log(error.message);
        }
    },
    add_coupon: async (req,res)=>{
     try {
        
    const data = new couponModel({
          coupon_name:req.body.couponName,
          description:req.body.description,
          price: req.body.price,
          discountPrice: req.body.discountPrice,
          code: req.body.code
    })
      await data.save()
      res.redirect('/admin/coupons')

     } catch (error) {
        console.log(error.message);
     }
    },
    del_coupon: async (req,res)=>{
        await couponModel.deleteOne({_id:req.params.id})
        res.redirect('/admin/coupons')
    },
    edit_coupon_page: async (req,res)=>{
        try {
            const data = await couponModel.findOne({_id:req.params.id})
            res.render('coupon/edit-coupon',{data})
        } catch (error) {
            console.log(error.message);
        }
    },
    do_edit_coupon: async (req,res)=>{
        try {
            console.log("dfffd");
         const result =  await couponModel.updateOne({_id:req.params.id},{$set:{
          coupon_name:req.body.couponName,
          description:req.body.description,
          price: req.body.price,
          discountPrice: req.body.discountPrice,
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
    }
    
}