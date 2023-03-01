const admin = require('../models/adminModel')

const user = require('../models/userModel')

const product = require('../models/productModel')

const catagory = require('../models/catagory')

const brand = require('../models/brandsModel')


module.exports ={
    show_wishlist: async (req,res)=>{
        try {
            console.log("showing wish list");
            const data = await user.findOne({email:req.session.email}).populate('wishlist.product').exec()
            console.log("whis data : "+data);
            res.render('wishlist/wishlist',{data})
        } catch (error) {
            console.log(error.message);
        }
    } ,
    add_to_wishlist: async(req,res)=>{
        try {
            const exist = await user.findOne({email:req.session.email,"wishlist.product":req.params.id})
            if(exist){
          console.log("item already in wishlist !!");
            }else{
                 const wishlistInserted = await user.updateOne({ email: req.session.email }, { $push: { wishlist: { product: req.params.id } } })
            console.log("item added to wishlist");  
            }
     
        } catch (error) {
            console.log(error.message);
        }
    },
    delete_wishlist: async (req,res)=>{
        try {
            await user.updateOne({email:req.session.email},{$pull:{wishlist:{product:req.params.id}}})
            res.redirect('/show-wishlist')
        } catch (error) {
          console.log(error.message);
        }
    }
}