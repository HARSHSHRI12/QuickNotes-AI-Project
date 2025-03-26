const mongoose=require('require');
const bcrypt=require('bcrypt');
const UserSchema=new mongoose.Schema({
    username:{
    type:String,
    require:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    ReEnterpassword:{
        type:String,
        required:true
    }
});
//function for compaire password
UserSchema.methods.comparePassword=async function(candidatepassword){
    try{
        //provide password with hash password
        const ismatch=await bcrypt.compare(candidatepassword,this.password);
        return ismatch;
    }
    catch(err){
        console.log()
    }
}

UserSchema.pre('save',async function(next){
    //if password is modifyed
    if(!person.isModified('password')){
        return next();
    }
    try{
        //hash generate
        const salt=await bcrypt.genSalt(10);

        //add salting  in hashing
        const hashpassword=await bcrypt.hash(person.password,salt);
        person.password=hashpassword;
        next();
    }
    catch(err){
        throw err;
    }
});
const user=mongoose.model('user',UserSchema);
module.exports=user;