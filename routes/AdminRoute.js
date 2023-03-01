
// SETTING EXPRESS
const express = require('express')
const session = require('express-session')
const app = express()

// SESSION HANDLING MIDDLE WARES
const {  logcheck,
         notloged } = require('../middlewares/logchecker')

// CONTROLLERS
const sub = require('../controllers/subController')
const ac = require('../controllers/adminController')

//MULTERS
const {upload,
       brands,
       cata,
       banner} = require('../multers/multer')

// FS MODULE
const fs = require('fs')

// SET UP  VIEW ENGINE | BODYPARSER
const path = require('path')
app.use(express.static(path.join(__dirname,"public")))
const bodyParser=require('body-parser')
app.set("views","views/admin")
app.use(bodyParser.urlencoded({ extended: false }));


// <------------------------------------------------------------------------------------------------------------------>
// <------------------------------------------------------------------------------------------------------------------>

// ADMIN MANAGMENT

app.get('/',ac.Adminlogin)
app.get('/adminlogin',notloged,ac.adminlogs)
app.post('/adminlogin',ac.admincheck)
app.get('/adminhome',logcheck,ac.adminhome)
app.get('/adminlogout',ac.adminlogout)

//    !---------------------------------------------------------!

// PRODUCT MANAGMENT
app.get("/addproduct",logcheck,ac.addproduct)
app.post("/addproduct",logcheck,upload.array("image",4),ac.adddata)
app.get('/products',logcheck,ac.show_product)
app.get('/view-product/:id',logcheck,ac.view_product_page)
app.get('/unlist-product/:id',logcheck,ac.unlist)

app.get('/delete-product-image/:imgid/:proid',logcheck,ac.delete_image)
app.post('/edit-image/:id',logcheck,upload.array("image",4),ac.do_edit_image)
app.get('/delete-product/:id',logcheck,ac.delete_product)
app.get("/edit-product/:id",logcheck,ac.edit_product)
app.post('/edit-product/:id',logcheck,ac.do_edit_product)

//    !---------------------------------------------------------!

// USER MANAGMENT

app.get('/users',logcheck,ac.getall_users)
app.get('/block-user/:id',logcheck,ac.block_user)

//    !---------------------------------------------------------!

// CATAGORY MANAGMENT

app.get('/catagory',logcheck,ac.show_catagory)
app.get('/add-catagory',logcheck,ac.add_catagory_page)
app.post('/add-catagory',logcheck,cata.single('image'),ac.add_catagory)
app.get('/delete-cata-img/:proid/:imgid',logcheck,sub.edit_cata_img)

app.get("/delete-category/:id",logcheck,ac.delete_catagory)
app.get("/edit-category/:id",logcheck,ac.edit_category_page)
app.post("/edit-category/:id",logcheck,cata.single("image"),ac.edit_category)
app.get('/unlist-category/:id',logcheck,ac.unlist_catagory)

//    !---------------------------------------------------------!

// BRAND MANAGMENT

app.get('/brands',logcheck,ac.brands)
app.get("/add-brand",logcheck,ac.add_brand)
app.post('/add-brand',logcheck,brands.single('image'),ac.save_brand)

app.get('/edit-brand/:id',logcheck,ac.edit_brand)
app.post('/edit-brand/:id',logcheck,brands.single('image'),ac.do_edit_brand)
app.get('/delete-brand/:id',logcheck,ac.delete_brand)

//    !---------------------------------------------------------!

// BANNER MANAGMENT

app.get('/banner',logcheck,sub.banner)
app.get('/add-banner',logcheck,sub.addBanner)
app.post('/add-banner',logcheck,banner.single('image'),sub.banner_save)
app.get('/delete-banner/:id',logcheck,sub.delete_banner)

app.get('/edit-banner/:id',logcheck,sub.edit_banner)
app.post('/edit-banner-data/:id',logcheck,sub.do_edit_banner)
app.post('/edit-banner-img/:id',logcheck,banner.single('image'),sub.edit_banner_img)
app.get('/delete-banner-image/:id/:obj',logcheck,sub.delete_image)

//    !---------------------------------------------------------!

// COUPON MANAGMENT

app.get('/coupons',logcheck,sub.show_coupons)
app.post('/add-coupon',logcheck,sub.add_coupon)
app.get('/delete-coupon/:id',logcheck,sub.del_coupon)
app.get('/edit-coupon/:id',logcheck,sub.edit_coupon_page)
app.post('/edit-coupon/:id',logcheck,sub.do_edit_coupon)

//    !---------------------------------------------------------!


// <------------------------------------------------------------------------------------------------------------------>
// <------------------------------------------------------------------------------------------------------------------>


// ERROR PAGE

app.use(function(req, res, next) {

    res.render('admin_error');
  });
 
// <------------------------------------------------------------------------------------------------------------------>
// <------------------------------------------------------------------------------------------------------------------>

module.exports=app

