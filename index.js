const express= require('express')
const app=express();
const course= require('./routes/classes')
const student= require('./routes/students')
const bodyParser=require('body-parser');
const mongoose= require('mongoose')
const transcriptRouter = require('./routes/transcript');
const cors = require('cors');


const corsOptions = {
    origin: ['http://localhost:3000'], // Allow specific origins
    credentials: true, // Allow cookies to be sent with requests
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
};
console.log("CORS configured");

// Log requests for debugging
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

app.use(cors(corsOptions));

app.use((req,res,next)=>{
    res.setHeader('Access-control-allow-Origin','*')
    res.setHeader('Access-control-allow-Methods','GET, POST , PUT,DELETE')
    res.setHeader('Access-control-allow-Headers','Content-Type, Authorization')
    console.log("CORS headers set")
    next();
});



app.use(bodyParser.json());
console.log("Body parser configured")

app.use('/courses', course);  // Now, all routes in `course` will start with `/courses`
console.log("Course routes configured");
app.use('/students', student);  // Routes in `student` will start with `/students`
console.log("Student routes configured");
app.use('/transcripts', transcriptRouter);  // Similarly, transcript routes will start with `/transcripts`
console.log("Transcript routes configured");



mongoose.set('debug', true);

mongoose.connect("mongodb+srv://krishaang0191:franklin123@puma-cluster.idynkdh.mongodb.net/Puma")
.then(result=>{
    console.log("MongoDB is connected")
    app.listen('8000', () => {
        console.log("Backend is listening at port 8000");
     });
})
.catch(e=> console.log(e)); // error in connecting to mongodb
