const mongoose=require('mongoose');
require('dotenv').config();
const mongoURL=process.env.mongourl;
mongoose.connect(mongoURL);
//handeller
const QuickDB=mongoose.connection;
QuickDB.on('connected',()=>{
    console.log('Database Server is Start....');
});
QuickDB.on('disconnected',()=>{
    console.log('Database Server Disconnected...');
});
QuickDB.on('err',(err)=>{
    console.log('Internal Database error',err);
});
module.exports=QuickDB;