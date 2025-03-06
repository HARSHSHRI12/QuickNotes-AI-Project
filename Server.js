const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
//import all things that will required to use Gemini api's
require("dotenv").config();
const cors = require('cors');
app.use(cors());

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAi = new GoogleGenerativeAI(process.env.API_KEY);
//get for entry point

app.get('/',(req,res)=>{
  res.send('Hello Harsh Welcome Back...');
});

//const model=genAi.getGenerativeModel({gemini:'gemini-1.5-flash'});
const model = genAi.getGenerativeModel({ model: "gemini-1.5-flash" });
//const prompt = "what you can do ";

//defination of generat function
const generate=async(prompt)=>{
  const result=await model.generateContent(prompt);
  return result.response.text();
}
app.post('/generate',async(req,res)=>{
    try {
        const {prompt}=req.body;
        if(!prompt){
           return res.status(400).json({err:'Prompt is require..'})
        }
        const responseTxt = await generate(prompt);
        res.json({response:responseTxt});
    } catch (err) {
      console.error("API Error:", err);
        console.log(err);
      }
    
});
 
app.listen(3500, () => {
  console.log("Server is Start...");
});
