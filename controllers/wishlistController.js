const admin = require('../models/adminModel')

const user = require('../models/userModel')

const product = require('../models/productModel')

const catagory = require('../models/catagory')

const brand = require('../models/brandsModel')


module.exports ={
    show_wishlist: async (req, res, next)=>{
        try {
            const data = await user.findOne({email:req.session.email}).populate('wishlist.product').exec()
            res.render('wishlist/wishlist',{data,users:true})
        } catch (error) {
          next()
        }
    } ,
    add_to_wishlist: async(req, res, next)=>{
        try {
            const exist = await user.findOne({email:req.session.email,"wishlist.product":req.params.id})
            if(exist){
          res.json({failed:true})
            }else{
                 const wishlistInserted = await user.updateOne({ email: req.session.email }, { $push: { wishlist: { product: req.params.id } } })
            res.json({success:true})
            }
     
        } catch (error) {
            res.render("user_error")

        }
    },
    delete_wishlist: async (req, res, next)=>{
        try {
            await user.updateOne({email:req.session.email},{$pull:{wishlist:{product:req.params.id}}})
            res.json({success:true})
        } catch (error) {
            res.render("user_error")

        }
    }
}