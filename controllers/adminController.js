const admin = require('../models/adminModel')

const user = require('../models/userModel')

const product = require('../models/productModel')

const catagory = require('../models/catagory')

const brand = require('../models/brandsModel')

var objectId=require('mongodb').ObjectId

const fs = require('fs')

const path = require('path')





module.exports = {
    adminlogout :async (req,res)=>{
        try{
  req.session.admin=null
        res.redirect('/admin')
        }catch(error){
            console.log(error.message);
        }
      
   },
   adminlog : async (req,res)=>{
    try{
    if(req.session.admin){
       res.redirect('')
    }else{
        res.render('adminlogin')
    }
    }catch(error){
        console.log(error.message);
    }

},
 Adminlogin : async (req, res) => {
    try{
    if(req.session.admin){
     
      res.render('adminhome')
 
    }else if(req.session.log){
        req.session.log=false
        res.render("adminlogin")    
        
    }
    else{
      res.render("adminlogin")    
    }
    }catch(error){
        console.log(error.message);
    }

  
},
adddata: async (req,res)=>{
    try{
   const images = []

    for(file of req.files){
        images.push(file.filename)
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
   if(result){
    res.redirect('/admin/products')
   }else{
    console.log("not saved");
   }
    }catch(error){
        console.log(error.message);
    }  
 
}
,
 admincheck : async (req, res) => {
    try{
    const email = req.body.email
    const password = req.body.password
    console.log(email);
    console.log(password);

    const Data = await admin.findOne({ email: email,password:password})
    if(Data){
         req.session.admin=true
       res.redirect("/admin/adminhome")
    }else{
        console.log('login faild');
        req.session.log=true
        res.render('adminlogin',{message:"invalid email or password"})
    }
    }catch(error){
        console.log(error.message);
    }


},
adminhome : async (req,res)=>{
    try{
    console.log("test 1");
    if(req.session.admin){
     res.redirect("/admin")
    }else{
        res.redirect('/adminlogin')
    }
    
    }catch(error){
        console.log(error.message);
    }

},
addproduct: async (req,res)=>{
    try{
    const data = await catagory.find()
    const brands = await brand.find()
    if(req.session.admin){
        res.render('products/addproduct',{data,brands})
    }else{
        res.redirect('/admin')
    }
    }catch(error){
        console.log(error.message);
    }

},
show_product: async (req,res)=>{
    try{
    const cata= await product.find({})
    const data= await product.find({}).populate('catagory').exec()
    console.log("populate cata.catagory :",cata);
    res.render("products/products",{data,cata})
    }catch(error){
        console.log(error.message);
    }

},
getall_users: async (req,res)=>{
    try{
    const allusers= await user.find()
    res.render('users/userlist',{allusers})
    }catch(error){
        console.log(error.message);
    }

},
delete_product: async(req,res)=>{
    try{
  const imgId =req.params.id
   fs.unlink(path.join(__dirname,'../public/products',imgId),()=>{})
    product.deleteOne({_id:req.params.id}).then(()=>{
        res.redirect('/admin/products')
    })
    }catch(error){
        console.log(error.message);
    }
 
},
edit_product: async (req,res)=>{
    try{
   const data = await  product.findOne({_id:req.params.id}).populate('catagory').exec()
   const cata = await  catagory.find()
   const brands = await brand.find()
   res.render("products/edit-product",{data,cata,brands})
    }catch(error){
        console.log(error.message);
    }

},
do_edit_product: async (req,res)=>{

    try{
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
    }catch(error){
        console.log(error.message);
    }
 
},
show_catagory: async (req,res)=>{
    try{
   const data = await catagory.find()
  res.render("products/catagory-list",{data})
    }catch(error){
        console.log(error.message);
    }
 
},
add_catagory_page: async (req,res)=>{
    try{
  res.render('products/add-catagory')
    }catch(error){
        console.log(error.message);
    }
  
},
 add_catagory: async (req,res)=>{
    try{
        if(req.body.description == '' || req.body.catagoryname == ''){
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
             console.log("catagory saved successfully");
            res.redirect('/admin/catagory')
          }     
    } 
}  
    }catch(error){
        console.log(error.message);
    }
  
},
delete_catagory: async (req,res)=>{
    try{
   catagory.deleteOne({_id:req.params.id}).then(()=>{
        res.redirect('/admin/catagory')
    })
    }catch(error){
        console.log(error.message);
    }
},
edit_category: async (req,res)=>{
    try{
    const cname=req.body.catagoryname
    const cap = cname.toUpperCase()
    const datas= await catagory.findOne({_id:req.params.id})
    let exist = await catagory.findOne({catagory_name:cap})
    
     await  catagory.updateOne({_id:req.params.id},{$set:{
        catagory_name:cap,
        description:req.body.description,
        image:req.file.filename
    }}) 
        res.redirect("/admin/catagory")

    }catch(error){
        console.log(error.code);
        if(error.code){

            const data= await catagory.findOne({_id:req.params.id})
   
           res.render('products/edit-catagory',{data,message:"this catagory already exist"})
        }else{
            console.log(error.message);
        }
    }

},
edit_category_page: async (req,res)=>{
    try{
  const data= await catagory.findOne({_id:req.params.id})
    res.render('products/edit-catagory',{data})
    }catch(error){
        console.log(error.message);
    }
  
},
view_product_page: async (req,res)=>{
    try{
  const data = await product.findOne({_id:req.params.id}).populate('catagory').exec()
  
     
     res.render('products/view-product',{data})
    }catch(error){
        console.log(error.message);
    }
   
},
brands: async (req,res)=>{
    try{
 const data= await brand.find()
    res.render('brands/brands_list',{data})
    }catch(error){
        console.log(error.message);
    }
   
},
add_brand: async (req,res)=>{
    try{
   res.render('brands/add_brand')
    }catch(error){
        console.log(error.message);
    }
 
},
save_brand: async (req,res)=>{
    try{
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
    }catch(error){
        console.log(error.message);
    }

    },
    
    edit_brand: async (req,res)=>{
        try{
        const data = await brand.findOne({_id:req.params.id})
        res.render("brands/edit_brand",{data})
        }catch(error){
            console.log(error.message);
        }
        
    },
    do_edit_brand: async (req,res)=>{
        try{
        brand.updateOne({_id:req.params.id},
            {name:req.body.name,
            description:req.body.description,
            image:req.file.filename
            }
            ).then(()=>{
                res.redirect('/admin/brands')
            })
        }catch(error){
            console.log(error.message);
        }

    },
    delete_brand: async (req,res)=>{
        try{
       brand.remove({_id:req.params.id}).then(()=>{
            res.redirect('/admin/brands')
        })
        }catch(error){
            console.log(error.message);
        }
 
    },
     do_edit_image: async (req,res)=>{
        try{
      const id = req.params.id
const data = await product.findOne({_id:id})

if(data.image.length <= 4){
      console.log("reached");
         const images = []
    for(file of req.files){
        images.push(file.filename)
    }
    if(data.image.length + images.length <= 4 ){
 const a= await product.updateOne({_id:req.params.id},{$addToSet:{image:{$each:images}}})
        if(a){
               console.log("image updated");
               const a = req.params.id

            res.redirect('/admin/edit-product/'+ a)
        }else{
            res.redirect('/admin/products')
        }
    }else{
        try{
            const data = await  product.findOne({_id:req.params.id})
            const cata = await  catagory.find()
            const brands = await brand.find()
            let imgfull = true
            res.render("products/edit-product",{data,cata,brands,imgfull})
                imgfull = false
             }catch(error){
                 console.log(error.message);
             }

}
}else{
     res.redirect('/admin/products')
}



        }catch(error){
            console.log(error.message);
        }

    },
    block_user: async (req,res)=>{
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
          console.log(error.message);
        }   
    },
    unlist : async (req,res)=>{
        try {
            const id = req.params.id
        const list = await product.findOne({_id:id},{unlisted:1,_id:0})
        if(list.unlisted == false){
        console.log("list is : "+list);
        product.updateOne({_id:id},{$set:{unlisted:true}}).then(()=>{
            res.redirect('/admin/products')
        })
    }else{
        product.updateOne({_id:id},{$set:{unlisted:false}}).then(()=>{
            res.redirect('/admin/products')
    })
    } 
        } catch (error) {
          console.log(error.message);
        }
},
delete_image: async (req,res)=>{
    try {
     const imgId = req.params.imgid
    const proid = req.params.proid

    fs.unlink(path.join(__dirname,'../public/products',imgId),()=>{})
    await product.updateOne({ _id: proid }, { $pull: { image: imgId } });

    res.redirect('/admin/edit-product/'+proid)     
    } catch (error) {
      console.log(error.message);
    }
},
adminlogs: async (req,res)=>{
    try {
      res.render('adminlogin')   
    } catch (error) {
      console.log(error.message);
    } 
},
unlist_catagory: async (req,res)=>{
    try {
        const cata = await catagory.findOne({_id:req.params.id})
        if(cata.unlisted == true){
            await catagory.updateOne({_id:req.params.id},{$set:{unlisted:false}})
        }else{
            await catagory.updateOne({_id:req.params.id},{$set:{unlisted:true}})
        }
        res.redirect('/admin/catagory')
    } catch (error) {
        console.log(error.message);
    }
}
}