const passport=require('passport');
const localStrategy=require('passport-local').Strategy;
const customer = require('../model/User');
passport.use(new localStrategy(async(USERNAME,password,done)=>{
    try{
  
    const user=await customer.findOne({username:USERNAME});
    if(!user){
        return done(null,false,{message:'Invalid username...'});
    }
    const ispasswordmatch=user.comparePassword(password);
    if(ispasswordmatch){
      return done(null, user);
    }
    else{
        return done(null, false, {message:'Invalid password...'});
    }
    }
    catch(err){
        return done(err);
    }
}));

module.exports=passport;