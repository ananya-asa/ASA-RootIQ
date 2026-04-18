const path = require('path');
const express=require('express');  //for creating a web server
const cors=require('cors');        //for cross-origin resource sharing
require('dotenv').config({ path: path.join(__dirname, '.env') });
const {GoogleGenerativeAI}=require('@google/generative-ai');


const app=express();
app.use(cors());
app.use(express.json()); //for parsing JSON bodies

const genAI=new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/analyze',async(req,res)=>{
    const {code,error,mode}=req.body;

    const prompt = mode === 'quick'
? `You are ASA RootIQ. A student has this error:
ERROR: ${error}
CODE: ${code}
Reply in EXACTLY this format, nothing else:
PROBLEM: (one sentence, max 10 words)
FIX: (corrected code only, no explanation)`

: `You are ASA RootIQ — an AI Debugging Mentor for student developers.
A student has encountered this error:
ERROR: ${error}
CODE: ${code}
Give a structured response in exactly this format:
1. WHAT WENT WRONG: (explain the error simply)
2. WHY IT HAPPENED: (explain the root cause)
3. HOW TO FIX IT: (give the corrected code)
4. HOW TO PREVENT IT: (teach the concept so they never make this mistake again)
5. QUICK QUIZ: (ask one question to test if they understood)
Be clear, friendly and educational. Talk like a mentor, not a robot.`;

      try{
        const model=genAI.getGenerativeModel({model:'gemini-2.5-flash'});
        const result=await model.generateContent(prompt);
        const response=result.response.text();
        res.json({success:true,analysis:response});
      }
      catch(err){
        res.status(500).json({ success: false, error: err.message });
      }
      
});

app.get("/",(req,res)=>{
    res.json({ message: 'ASA RootIQ Backend is running! 🚀' });
});

app.listen(process.env.PORT,()=>{
    console.log(`ASA RootIQ backend running on port ${process.env.PORT}`);
});