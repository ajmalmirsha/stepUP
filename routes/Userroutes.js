
// SETTING EXPRESS

const express = require('express')
const session = require('express-session')
const app = express()
//    !---------------------------------------------------------!

// CONTROLLERS

const user = require('../controllers/usercontroller')
const cart = require('../controllers/cartController')
const wishlist = require('../controllers/wishlistController')

//    !---------------------------------------------------------!

// REQUIREING SESSION HANDLING MIDDLE WARES

const { is_not,
        login,
        is_not_logged
      } = require('../middlewares/logchecker')
//    !---------------------------------------------------------!

// SET UP  VIEW ENGINE | BODYPARSER

const bodyParser = require('body-parser')

app.set("views", "views/user")

app.use(bodyParser.urlencoded({ extended: false }));

//    !---------------------------------------------------------!



// <------------------------------------------------------------------------------------------------------------------>
// <------------------------------------------------------------------------------------------------------------------>



//USER MANAGMENT

//gust user
app.get("/", is_not, user.guest)

// user home
app.get("/userhome", login, user.user_home)

//user login
app.get("/user_login", is_not, user.user_login)
app.post("/user_login", is_not, user.do_login)

//user signup
app.get("/usersignup", is_not, user.user_signup)

//user logout
app.get("/user_logout", user.user_logout)

//    !---------------------------------------------------------!

//OTP MANAGMENT

app.post("/usersignup", is_not, user.sendOTP)

app.post('/verifyotp', is_not_logged, user.verifyOTP)

app.get('/verifyotp', is_not_logged, user.verifyotps)

//    !---------------------------------------------------------!


// FORGOT PASSWORD MANAGMENT

app.get('/forget-password', is_not_logged, user.forget_load)

app.post('/forgot-password', is_not_logged, user.forget_otp_load)

app.post('/verify_forgot_otp', is_not_logged, user.verifyforgotOTP)

app.post('/new-password-save', is_not_logged, user.save_new_password)

//    !---------------------------------------------------------!


// RESEND OTP
app.post('/resend-otp', is_not_logged, user.sendresendOTP)

app.get('/resend-otp', is_not_logged, user.sendresendOTP_load)

//    !---------------------------------------------------------!



// LOGGED USERS

app.use(login)


//PRODUCT MANAGMENT
app.get('/view-detail/:id', user.view_detail)

app.post('/search-product', user.search_product)

app.get('/search-product', user.search_product_page)

app.get('/shop', user.shop)

//    !---------------------------------------------------------!

// SORT

app.get('/sort-product/lowtohigh', user.lowtohigh)

app.get('/sort-product/hightolow', user.hightolow)

//    !---------------------------------------------------------!

//CATAGORY MANAGMENT

app.get('/catagory/:id', user.catagory)

app.get('/sort-catagory/:id', user.sort_catagory)

//    !---------------------------------------------------------!

//CART MANAGMENT

app.get('/show-cart', cart.show_cart)

app.get('/add-to-cart/:id', cart.do_add_cart)

app.post('/change-Product-Quantity', cart.changeqty)

app.get('/delete-from-cart/:id', cart.delete_item)

//    !---------------------------------------------------------!

// COUPON MANAGMENT

app.get('/coupon-apply', cart.show_cart)

app.post('/coupon-apply', cart.coupon_apply)

//    !---------------------------------------------------------!

// BRANDS
app.get('/brands/:brand', user.brands)

//    !---------------------------------------------------------!

//WISHLSIT MANAGMENT

app.get('/show-wishlist', wishlist.show_wishlist)

app.get('/add-to-wish-list/:id', wishlist.add_to_wishlist)

app.get('/delete-wishlist/:id', wishlist.delete_wishlist)

//    !---------------------------------------------------------!


// <------------------------------------------------------------------------------------------------------------------>
// <------------------------------------------------------------------------------------------------------------------>

//ERROR PAGE
app.use(function (req, res, next) {

  res.render('user_error');
});

// <------------------------------------------------------------------------------------------------------------------>
// <------------------------------------------------------------------------------------------------------------------>

module.exports = app