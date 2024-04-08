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
    SpireID: {
        type:String,
        required: true
    }

})


module.exports=mongoose.model('Student',studentSchema,'Student');