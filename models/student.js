const mongoose=require('mongoose')
const Schema= mongoose.Schema

const studentSchema= new Schema({
    Username: {
        type : String,
        required: true
    },
    Password :{
        type:String,
        required:true
    },

    Transcript :[
        [
            {
                CourseName : String,
                Grade : String
            }
        ]
    ]

})


module.exports=mongoose.model('Student',studentSchema,'Student');
