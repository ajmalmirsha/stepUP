//MODULES REQUIRING

const multer = require('multer')
const path = require('path')

// <------------------------------------------------------------------------------------------------------------------>
// <------------------------------------------------------------------------------------------------------------------>


// MULTER FOR PRODUCT
const storage = multer.diskStorage({
    destination:function(req,file,cb){
   cb(null,path.join(__dirname,"../public/products"))
    },
    filename:function(req,file,cb){
     const name = Date.now()+"-"+file.originalname
     cb(null,name)
    }
})

const upload= multer({storage:storage})

//    !---------------------------------------------------------!

// MULTER FOR BRANDS
const brandsStorage = multer.diskStorage({
    destination:function(req,file,cb){
   cb(null,path.join(__dirname,"../public/brands"))
    },
    filename:function(req,file,cb){
     const name = Date.now()+"-"+file.originalname
     cb(null,name)
    }
})

const brands= multer({storage:brandsStorage})

//    !---------------------------------------------------------!

// MULTER FOR CATAGORY
const catgoryStorage = multer.diskStorage({
 
    destination:function(req,file,cb){
   cb(null,path.join(__dirname,"../public/catagory-img"))
    },
    filename:function(req,file,cb){
     const name = Date.now()+"-"+file.originalname
     cb(null,name)
    }
    
})

const cata= multer({storage:catgoryStorage})

//    !---------------------------------------------------------!

// MULTER FOR BANNER
const bannerStorage = multer.diskStorage({
  destination:function(req,file,cb){
 cb(null,path.join(__dirname,"../public/banner-img"))
  },
  filename:function(req,file,cb){
   const name = Date.now()+"-"+file.originalname
   cb(null,name)
  }
})

const banner= multer({storage:bannerStorage})

//    !---------------------------------------------------------!


// <------------------------------------------------------------------------------------------------------------------>
// <------------------------------------------------------------------------------------------------------------------>

module.exports={
    upload,brands,cata,banner
}