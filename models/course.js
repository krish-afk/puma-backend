const mongoose=require('mongoose')
const Schema= mongoose.Schema

const courseSchema= new Schema({
    Name: {
        type:String,
        required: true
    },
    Description: {
        type : String,
        required: true
    },
    Prerequisities: [
        [
            [
                {
                    courseName:{type: Schema.Types.ObjectId, required:true},
                    grade:String
                }
            ]
        ]
    ],
    searchName :{
        type:String,
        required: true
    },
    compName :{
        type:String,
        required:true
    }

}, { versionKey: false })


module.exports=mongoose.model('Course', courseSchema, 'Course');
