const express=require('express');
const router=express.Router();
const customer=require('../models/customer');
const { jwtAuthMiddleware,generateToken } = require('../jwt');

//create method for customer

router.post('/signup',async(req,res)=>{
    try{
     const data=req.body;
     const newcustomer=new customer(data);
     const response=await newcustomer.save();
     console.log('data is saved...');
     const token=generateToken(response.username);
     console.log('token is :',token);
     res.status(200).json({response:response,token:token});
     const payload={
        id:response.id,
        username:response.username
     }
     console.log(JSON.stringify(payload));
    }
    catch(err){
        console.log(err);
        res.status(500).json({err:'Internal Server error...'});
    }
});

//create login method for customer

router.post('/login',async(req,res)=>{
    try{
      //extract username and password from request.body
      const {username,password}=req.body;

      console.log("Login Attempt:", req.body);


      //find the user from username

      const user=await customer.findOne({username:username});

      //check username or password is exist or not
      if(!user || !(await user.comparePassword(password))){
        return res.status(401).json({error:'Invalid username and password...'});
      }
      //genrate token

      const payload={
        id:user.id,
        username:user.username
      }
      const token=generateToken(payload);

      //return token as response
      res.json({token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({err:'Internal server error...'});
    }
});
// create get method for profile

router.get('/profile',jwtAuthMiddleware,async(req,res)=>{
  try{
    const userData=req.user;
    console.log("User Data is :",userData);
    const userid=userData.id; 
    const user=await customer.findById(userid);
    console.log(userData);
    res.status(200).json(user ? {user} :{error:'user data is not found..'});
    console.log(user);
  }
  catch(err){
    console.log(err);
    res.status(500).json({err:'Internal Server error...'});
  }
});

//get method for customer

router.get('/',jwtAuthMiddleware,async(req,res)=>{
    try{
      const response=await customer.find();
      console.log('customer info is founded...');
      res.status(200).json(response);
    }
    catch(err){
        console.log(err);
        res.status(500).json({err:'Internal Server error...'});
    }
});

//get method with URL Perimetries

 router.get('/:name',async(req,res)=>{
     try{
       const customerName=req.params.name;
       if(['harsh','anshu','suresh','rakesh','priya'].includes(customerName)){
        const response=await customer.find({name:customerName});
        console.log('customer info is founded...');
        res.status(200).json(response);       
      }
      else{
        return res.status(404).json({message:'customer is  founded...'});
      }
    }
    catch(err){
        console.log(err);
        res.status(500).json({err:'Internal server error...'});
    }
});

//put method for customer 

router.put('/:id',async(req,res)=>{
    try{
    const customerid=req.params.id;
    const customerdata=req.body;
    const response=await customer.findByIdAndUpdate(customerid,customerdata,{
        new:true,
        runValidators:true
    });
    if(!response){
        return res.status(404).json({message:'customer info is not founded...'});
    }
    console.log('customer info is Updated...');
    res.status(200).json(response);
    }
    catch(err){
        console.log(err);
        res.status(500).json({err:'Internal server error...'});
    }
});

//delete method for customer

router.delete('/:id',async(req,res)=>{
    try{
     const customerid=req.params.id;
     const response=await customer.findByIdAndDelete(customerid);
     if(!response){
        return res.status(404).json({message:'customer info is not founded...'});
     }
     console.log('customer info is deleted...');
     res.status(200).json(response);
    }
    catch(err){
        console.log(err);
        res.status(500).json({err:'Internal Server error...'});
    }
});
module.exports=router;
