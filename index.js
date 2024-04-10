const express= require('express')
const app=express();
const course= require('./routes/classes')
const student= require('./routes/students')
const bodyParser=require('body-parser');
const mongoose= require('mongoose')

const transcriptRouter = require('./routes/transcript');



app.use((req,res,next)=>{
    res.setHeader('Access-control-allow-Origin','*')
    res.setHeader('Access-control-allow-Methods','GET, POST , PUT,DELETE')
    res.setHeader('Access-control-allow-Headers','Content-Type, Authorization')
    next();
});


app.use((req,res,next)=>{
    res.setHeader('Access-control-allow-Origin','*')
    res.setHeader('Access-control-allow-Methods','GET, POST , PUT,DELETE')
    res.setHeader('Access-control-allow-Headers','Content-Type, Authorization')
    next();
});

app.use(bodyParser.json());
app.use(course)
app.use(student)
app.use(transcriptRouter);

// app.listen('8000',()=>{
//             console.log("Backend is listening at port 8000")
//  })

mongoose.set('debug', true);

mongoose.connect("mongodb+srv://krishaang0191:franklin123@puma-cluster.idynkdh.mongodb.net/Puma")
.then(result=>{
    console.log("MongoDB is connected")
    app.listen('8000',()=>{
        console.log("Backend is listening at port 8000")
    })
})
.catch(e=> console.log(e)); // error in connecting to mongodb
