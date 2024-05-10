const Course= require('../models/course')
const mongoose= require('mongoose')

exports.getClasses=async(req,res)=>{  
    try {
      // Find the course by searchName
      const query = { searchName: req.query.course };
      const course = await Course.findOne(query);
      console.log(course)
      if (!course) {
          return res.status(404).json({ message: "Course not found" });
      }
      return res.json(course);
  } catch (error) {
      // Handle errors
      console.error("Error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
  }
}
