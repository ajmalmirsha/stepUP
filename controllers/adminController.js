const admin = require('../models/adminModel')

const user = require('../models/userModel')

const product = require('../models/productModel')

const catagory = require('../models/catagory')

const brand = require('../models/brandsModel')

var objectId=require('mongodb').ObjectId

const fs = require('fs')

const path = require('path')
const { populate } = require('../models/catagory')

const moment =  require('moment')
const orderModel = require('../models/orderModel')




module.exports = {
    adminlogout :async (req,res,next)=>{
        try{
  req.session.admin=null
        res.redirect('/admin')
        }catch(error){
          next()
        }
      
   },
   adminlog : async (req,res,next)=>{
    try{
    if(req.session.admin){
       res.redirect('')
    }else{
        res.render('adminlogin')
    }
    }catch(error){
      next()
    }

},
 Adminlogin : async (req, res,next) => {
    try{
    if(req.session.admin){
     
      res.redirect('/admin/adminhome')
 
    }else if(req.session.log){
        req.session.log=false
        res.render("adminlogin")    
        
    }
    else{
      res.render("adminlogin")    
    }
    }catch(error){
      next()
    }

  
},
adddata: async (req,res,next)=>{
    try{
        if(
            req.body.catagory==""||
            req.body.price==''||
            req.body.description==''||
            req.body.Quantity==''||
            req.body.brand==''
        ){
            const data = await catagory.find()
            const brands = await brand.find()
            res.render('products/addproduct',{data,brands,err:"all feilds are required"})
            
        }
   const images = []

    for(file of req.files){
        images.push(file.filename)
    }
    if(images.length == 0){
        const data = await catagory.find()
        const brands = await brand.find()
        res.render('products/addproduct',{data,brands,err:"product image required "})
       
    }

   const Data= new product({productname:req.body.productname,
        catagory:req.body.catagory,
        price:req.body.price,
        description:req.body.description,
        quantity:req.body.Quantity,
        image:images,
        brand:req.body.brand
    })
   const result = await Data.save()

    res.redirect('/admin/products')
  
    }catch(error){
      next()
    }  
 
}
,
 admincheck : async (req, res,next) => {
    try{
    const email = req.body.email
    const password = req.body.password
    if(email == ""||
    password == ""
    ){
        res.render('adminlogin',{message:"All feilds are required"})

    }else{

    const Data = await admin.findOne({ email: email,password:password})
    if(Data){
         req.session.admin=true
       res.redirect("/admin/adminhome")
    }else{
        req.session.log=true
        res.render('adminlogin',{message:"invalid email or password"})
    }  
    }
    
    }catch(error){
      next()
    }


},
adminhome : async (req,res,next)=>{
    try{
        const ord=await orderModel.find().populate({
            path: 'product.productId',
            populate: {
                path: 'catagory',
                model: catagory
            }
          })
          const catagoryCount = {};
          
          ord.forEach(order => {
              order.product.forEach(product => {
                  const catagory = product.productId.catagory.catagory_name;
                  if (catagory in catagoryCount) {
                      catagoryCount[catagory] += 1;
                  } else {
                      catagoryCount[catagory] = 1;
                  }
              });
          });
          const catacount = Object.entries(catagoryCount).sort((a, b) => b[1] - a[1]);
          
 

const numbersOnly = catacount.map(innerArray => innerArray[1]);

          




const categoryNames = catacount.map((categoryCount) => {
  return categoryCount[0];
});


const ordercount = await orderModel.find({status:"delevered"}).count()






        
        
        const salesChart = await orderModel.aggregate([
          
            {
                $match: { status: "delevered" } // Add $match stage to filter by status
              },
              {
                
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },

                sales: { $sum: '$cartTotalPrice' },
              },
            },
            {
              $sort: { _id: -1 },
            },
            {
              $limit: 7,
            },
          ]);
          

          const dates = salesChart.map((item) => {
            return item._id;
          })
      
          const sale = salesChart.map((item) => {
            return item.sales;
          });


      const salesr = sale.map((x)=>{
        return x
      })
     
      const date = dates.reverse()

     const sales = salesr.reverse()

     const cata = await orderModel.aggregate([
        {
            $group: {
                _id: "$productId.category",
                cata: {
                    $sum: "$cartTotalPrice"
                }
            }
        }
    ]);


//total saless

  const totalSales = await orderModel.find({status:"delevered"})

let sum = 0
for(var i=0;i<totalSales.length ; i++){
    sum =sum+totalSales[i].cartTotalPrice
}
const today = new Date()

const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1); // set yesterday's date by subtracting 1 day from today


const yesterdaySalesof = await orderModel.find({status:"delevered",date:yesterday})
let yesterdaySalesSum = 0
for(var i=0;i<yesterdaySalesof.length ; i++){
    yesterdaySalesSum =yesterdaySalesSum + yesterdaySalesof[i].cartTotalPrice
}

const todaySalesof = await orderModel.find({status:"delevered",date:today})
let todaySalesSum = 0
for(var i=0;i<todaySalesof.length ; i++){
    todaySalesSum =todaySalesSum+todaySalesof[i].cartTotalPrice
}

// payment metthod wise pie chart

const UPI = await orderModel.find({status:"delevered",paymentMethod:"UPI"}).count()
const COD = await orderModel.find({status:"delevered",paymentMethod:"COD"}).count()
const WALLET = await orderModel.find({status:"delevered",paymentMethod:"WALLET"}).count()

        res.render('adminhome',{
            date,
            sales,
            sum,
            UPI,
            COD,
            WALLET,
            catacount,
            numbersOnly,
            categoryNames,
            ordercount
        })
 
    
    }catch(error){
      next()
    }

},
addproduct: async (req,res,next)=>{
    try{
    const data = await catagory.find()
    const brands = await brand.find()
    if(req.session.admin){
        res.render('products/addproduct',{data,brands})
    }else{
        res.redirect('/admin')
    }
    }catch(error){
      next()
    }

},
show_product: async (req,res,next)=>{
    try{
    const cata= await product.find({})
    let data= await product.find({}).populate('catagory').populate('brand').exec()
    data = data.reverse()
    res.render("products/products",{data,cata,moment:moment})
    }catch(error){
      next()
    }

},
getall_users: async (req,res,next)=>{
    try{
    const allusers= await user.find()
    res.render('users/userlist',{allusers})
    }catch(error){
      next()
    }

},
delete_product: async(req,res,next)=>{
    try{
  const imgId =req.params.id
   fs.unlink(path.join(__dirname,'../public/products',imgId),()=>{})
    product.deleteOne({_id:req.params.id}).then(()=>{
        res.redirect('/admin/products')
    })
    }catch(error){
        res.render("admin_error")


    }
 
},
edit_product: async (req,res,next)=>{
    try{
   const data = await  product.findOne({_id:req.params.id}).populate('catagory').populate('brand').exec()
   const cata = await  catagory.find()
   const brands = await brand.find()
   res.render("products/edit-product",{data,cata,brands})
    }catch(error){
        res.render("admin_error")


    }

},
do_edit_product: async (req,res,next)=>{

    try{
        if(
        req.body.catagory==""||
        req.body.price==''||
        req.body.description==''||
        req.body.Quantity==''||
        req.body.brand==''
        ){
            const data = await  product.findOne({_id:req.params.id}).populate('catagory').populate('brand').exec()
            const cata = await  catagory.find()
            const brands = await brand.find()
            res.render("products/edit-product",{data,cata,brands,err:"all fields are required"}) 
        }else{
            
            product.updateOne({_id:req.params.id},{$set:{
                productname:req.body.productname,
                catagory:req.body.catagory,
                price:req.body.price,
                description:req.body.description,
                quantity:req.body.Quantity,
                brand:req.body.brand
            }}).then(()=>{
                res.redirect('/admin/products')
            })
        }
    }catch(error){
        res.render("admin_error")


    }
 
},
show_catagory: async (req,res,next)=>{
    try{
   let data = await catagory.find()
   data = data.reverse()
  res.render("products/catagory-list",{data})
    }catch(error){
      next()
    }
 
},
add_catagory_page: async (req,res,next)=>{
    try{
  res.render('products/add-catagory')
    }catch(error){
      next()
    }
  
},
 add_catagory: async (req,res,next)=>{
    try{
        if(req.body.description == '' || req.body.catagoryname == '' || req.file?.filename == undefined){
            res.render('products/add-catagory',{err:"All Fileds are required"})
        }else{
   const cat = req.body.catagoryname
   const catup =  cat.toUpperCase()
   let exist = await catagory.findOne({catagory_name:catup})
  
    if(exist){
      res.render('products/add-catagory',{err:"this catagory already exists"})
      exist=null
    }else{

        const Data = new catagory({catagory_name:catup,
            description:req.body.description,
            image:req.file.filename
        })
          const result = await Data.save()
          if(result){
            res.redirect('/admin/catagory')
          }     
    } 
}  
    }catch(error){
      next()
    }
  
},
delete_catagory: async (req,res,next)=>{
    try{
   catagory.deleteOne({_id:req.params.id}).then(()=>{
        res.redirect('/admin/catagory')
    })
    }catch(error){
        res.render("admin_error")


    }
},
edit_category: async (req,res,next)=>{
    try{
    const cname=req.body.catagoryname
    const cap = cname.toUpperCase()
    const datas= await catagory.findOne({_id:req.params.id})
    let exist = await catagory.findOne({catagory_name:cap})
    if(req.file?.filename !== undefined){
      await  catagory.updateOne({_id:req.params.id},{$set:{
        catagory_name:cap,
        description:req.body.description,
        image:req.file.filename
    }})  
    }else{
        await  catagory.updateOne({_id:req.params.id},{$set:{
            catagory_name:cap,
            description:req.body.description
        }}) 
    }
      
        res.redirect("/admin/catagory")

    }catch(error){
        if(error.code == 11000){

            const data= await catagory.findOne({_id:req.params.id})
         
           res.render('products/edit-catagory',{data,message:"this catagory already exist"})
        }else{
            res.render("admin_error")


        }
    }

},
edit_category_page: async (req,res,next)=>{
    try{
  const data= await catagory.findOne({_id:req.params.id})
    res.render('products/edit-catagory',{data})
    }catch(error){
        res.render("admin_error")


    }
      
},
view_product_page: async (req,res,next)=>{
    try{
  const data = await product.findOne({_id:req.params.id}).populate('catagory').exec()
  
     
     res.render('products/view-product',{data,moment:moment})
    }catch(error){
        res.render("admin_error")

    }
   
},
brands: async (req,res,next)=>{
    try{
 let data= await brand.find()
 data = data.reverse()
    res.render('brands/brands_list',{data})
    }catch(error){
      next()
    }
   
},
add_brand: async (req,res,next)=>{
    try{
   res.render('brands/add_brand')
    }catch(error){
      next()
    }
 
},
save_brand: async (req,res,next)=>{
    try{
        let name = req.body.name
        let description = req.body.description
     
         name = name.trim()
         description = description.trim()


        if(
            name=="" ||
            description=="" ||
            req.file?.filename == undefined
        ){
            res.render("brands/add_brand",{err:"all feilds are required !!"})

        }else{
           let exist = await brand.findOne({name:req.body.name})
    if(exist){
        exist = null
        res.render("brands/add_brand",{err:"this brand alredy exist"})
        
    }else{
          const data = new brand({
        name:req.body.name,
        description:req.body.description,
        image:req.file.filename
    })

    const result = await data.save()
    if(result){
        res.redirect('/admin/brands')
    }else{
        res.render("brands/add_brand",{err:"there is an error"})
    }
}  
        }
   
    }catch(error){
      next()
    }

    },
    
    edit_brand: async (req,res,next)=>{
        try{
        const data = await brand.findOne({_id:req.params.id})
        res.render("brands/edit_brand",{data})
        }catch(error){
            res.render("admin_error")

        }
        
    },
    do_edit_brand: async (req,res,next)=>{
        try{
            let name= req.body.name
            let description = req.body.description
            name = name.trim()
            description = description.trim()

            if(

                name=="" ||
                description=="" 

            ){
const data = await brand.findOne({_id:req.params.id})

                res.render("brands/edit_brand",{data,err:"all feilds are required !!"})
   
            }else{
         if(req.file?.filename == undefined){
            
            brand.updateOne({_id:req.params.id},
            {name:req.body.name,
            description:req.body.description
            }

            ).then(()=>{

                res.redirect('/admin/brands')

            })
         }else{
            brand.updateOne({_id:req.params.id},
                {name:req.body.name,
                description:req.body.description,
                image:req.file.filename
                }
    
                ).then(()=>{
    
                    res.redirect('/admin/brands')
    
                })
         }

            }
      
        }catch(error){
            res.render("admin_error")

        }

    },
    delete_brand: async (req,res,next)=>{
        try{
       brand.remove({_id:req.params.id}).then(()=>{
            res.json({sucess:true})
        })
        }catch(error){
            res.render("admin_error")

        }
 
    },
     do_edit_image: async (req,res,next)=>{
        try{
      const id = req.params.id
const data = await product.findOne({_id:id})

if(data.image.length <= 4){
         const images = []
    for(file of req.files){
        images.push(file.filename)
    }
    if(data.image.length + images.length <= 4 ){
 const a= await product.updateOne({_id:req.params.id},{$addToSet:{image:{$each:images}}})
        if(a){
               const a = req.params.id

            res.redirect('/admin/edit-product/'+ a)
        }else{
            res.redirect('/admin/products')
        }
    }else{
       
            const data = await  product.findOne({_id:req.params.id}).populate('catagory').populate('brand').exec()
            const cata = await  catagory.find()
            const brands = await brand.find()
            let err = "only 4 images you can add !!"
            res.render("products/edit-product",{data,cata,brands,err})
          
}
}else{
     res.redirect('/admin/products')
}



        }catch(error){
            res.render("admin_error")

        }

    },
    block_user: async (req,res,next)=>{
        try {
        const id = req.params.id
       const status = await user.findOne({_id:id},{block:1,_id:0})
       if(status.block == false){
         const wait = await  user.updateOne({_id:id},{$set:{block:true}})
         req.session.user= false
            res.redirect('/admin/users')
       }else{
        const wait = await  user.updateOne({_id:id},{$set:{block:false}})
        req.session.user= true
        res.redirect('/admin/users')
       }
     
        } catch (error) {
            res.render("admin_error")


        }   
    },
    unlist : async (req,res,next)=>{
        try {
            const id = req.params.id
        const list = await product.findOne({_id:id},{unlisted:1,_id:0})
        if(list.unlisted == false){
        product.updateOne({_id:id},{$set:{unlisted:true}}).then(()=>{
            res.redirect('/admin/products')
        })
    }else{
        product.updateOne({_id:id},{$set:{unlisted:false}}).then(()=>{
            res.redirect('/admin/products')
    })
    } 
        } catch (error) {
            res.render("admin_error")

        }
},
delete_image: async (req,res,next)=>{
    try {
     const imgId = req.params.imgid
    const proid = req.params.proid

    fs.unlink(path.join(__dirname,'../public/products',imgId),()=>{})
    await product.updateOne({ _id: proid }, { $pull: { image: imgId } });

    res.redirect('/admin/edit-product/'+proid)     
    } catch (error) {
        res.render("admin_error")

    }
},
adminlogs: async (req,res,next)=>{
    try {
      res.render('adminlogin')   
    } catch (error) {
    next()
    } 
},
unlist_catagory: async (req,res,next)=>{
    try {
        const cata = await catagory.findOne({_id:req.params.id})
        if(cata.unlisted == true){
            await catagory.updateOne({_id:req.params.id},{$set:{unlisted:false}})
        }else{
            await catagory.updateOne({_id:req.params.id},{$set:{unlisted:true}})
        }
        res.redirect('/admin/catagory')
    } catch (error) {
        res.render("admin_error")


    }
}
}