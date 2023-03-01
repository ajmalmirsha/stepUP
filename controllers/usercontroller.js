const user = require('../models/userModel')

const bcrypt = require('bcrypt');
const session = require('express-session');

const product = require('../models/productModel')

const brand = require('../models/brandsModel')

const catagory = require('../models/catagory');
const { brands } = require('./adminController');

const banners = require('../models/bannerModel');
const { populate } = require('../models/userModel');
require('dotenv').config()


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;
const client = require('twilio')(accountSid, authToken);



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
                        bcrypt.compare(req.body.password, data.password).then((result) => {
                            if (result) {
                                req.session.email = req.body.email
                                req.session.user = true
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
            res.redirect("/user_login")
        } catch (error) {
            console.log(error.message);
        }
    },
    view_detail: async (req, res) => {
        try {
            const singleproduct = await product.find({ _id: req.params.id ,unlisted:false}).populate('catagory').exec()
            const categoryData = await catagory.find()
            const user = true
            res.render('products/view-detail', { singleproduct, categoryData, user })
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
                res.render('catagory/catagory', { data })
            } else {
                const cata = req.params.id
                res.render('catagory/catanull', { cata })
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
            const brandName = req.params.brand
            const brand = await product.find({ brand: req.params.brand })
            console.log("brand:");
            console.log(brand);
            if (brand) {
                res.render('brand/brand', { brand ,brandName})
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
            res.render('shop', { data, cata, page, totalPages })
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
        res.render('shop', { data, cata })        
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

    }
}