 module.exports={
    logcheck:(req,res,next)=>{
      try {
        if(req.session.admin){
     next()
     }else{
     res.redirect('/admin')
     }  
      } catch (error) {
        res.render("admin_error")
      }
   
    },

    notloged : (req,res,next)=>{
      try {
       if(req.session.admin){
     res.redirect('/admin')
     }else{
     next()
     }  
      } catch (error) {
        res.render("admin_error")
      }
    
    },

    login:(req,res,next)=>{
      try {
       if(req.session.user){
     next()
     }else{
     res.redirect('/user_login')
     }  
      } catch (error) {
        res.render("user_error")
      }
    
    },

    is_not:(req,res,next)=>{
      try {
       if(req.session.user){
    console.log("rediurecting to home");
    res.redirect("/userhome")
    }else{
    next()
    }  
      } catch (error) {
        res.render("user_error")

      }
   
    },
   
    is_not_logged:(req,res,next)=>{
      try {
         if(req.session.email){
    console.log("rediurecting is not logged in to home");
    res.redirect("/userhome")
    }else{
    next()
    }
        } catch (error) {
          res.render("user_error")

        }
   
    }
    }