const Student= require('../models/student')

exports.createUser= async(req,res)=>{
  console.log("Hello")
    const { SpireID, Username, Password } = req.body;
    const newStudent = new Student({
        SpireID,
        Username,
        Password,
        Transcript : []
     },{ versionKey: false });  
     try {
        // Save the new student to the database
        const savedStudent = await newStudent.save();
        res.status(201).json(savedStudent); // Respond with the saved student
      } catch (error) {
        console.error("Error creating student:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }                                                                                                                                                                                                
}

exports.authenticateUser= async(req,res)=>{
    console.log(req.body)
    const {username,password}= req.body
    const student= await Student.findOne({Username: username})
    if(!student){
      return res.status(404).json({ message: "Student not found" });
    }
    const dbPassword= student.Password
    if(dbPassword===password){
      return res.status(200).json({message:"Authenticated!"})
    }

    return res.status(401).json({message:"Incorrect Password"})

}



