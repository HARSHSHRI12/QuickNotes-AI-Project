const jwt=require('jsonwebtoken');

//create middleware

const jwtAuthMiddleware=(req,res,next)=>{

  //first check request header has authorization or not

const authorization=req.headers.authorization;
if(!authorization){
  return res.status(401).json({error:'Invalid Token..'});
}
    //extract jwt token from request headers
    const token=req.headers.authorization.split(' ')[1];
    if(!token){
        return res.status(401).json({error:'Unotherization'});
    }
    try{
      //verify the jwt token
      const decoded=jwt.verify(token,process.env.JWT_SECRET);

      // attach user info to req object
      req.user=decoded;
      next();
    }
    catch(err){
        console.log(err);
        res.status(401).json({error:'Invalid Token!!'})
    }
};

//function to genrate token

const generateToken=(userData)=>{

    //generate new jwt token using user data
  return jwt.sign(userData,process.env.JWT_SECRET);
}

module.exports={jwtAuthMiddleware,generateToken};