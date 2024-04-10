
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Student = require('../models/students.js');

const upload = multer();

const extractTextFromPDF = async (fileBuffer) => {
    try {
        const data = await pdfParse(fileBuffer);
        return data.text;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        return null;
    }
};

exports.uploadTranscript = async (req, res) => {
    // username is now part of the form data, not URL parameters
        const fileBuffer = req.file.buffer;
        const username = req.body.username;
    
    if (!fileBuffer) {
        return res.status(400).send({ message: 'Please upload a file.' });
    }

    try {
        const text = await extractTextFromPDF(fileBuffer);

        if (!text) {
            return res.status(500).send({ message: 'Could not extract text from PDF' });
        }

       // Process the extracted text to find course names and grades
    const lines = text.split('\n');

    const courseCompsciLine = /COMPSCI\s+([A-Z]?\d+).*?([A-F][+-]?)(?=\s|\d)/ //extracts only the course name and the associated grade
    const courseCICSLine = /CICS\s+([A-Z]?\d+).*?([A-F][+-]?)(?=\s|\d)/ //extracts only the course name and the associated grade
    const courseMathLine = /MATH\s+([A-Z]?\d+).*?([A-F][+-]?)(?=\s|\d)/ //extracts only the course name and the associated grade
    const gradeForCoursesWithLettersInNums = /\d+\.\d+([A-Z])\d+\.\d+/ //handles courses with letters attached to course number
    const gradeForJrYearWriting = /ENGLWRIT\s+([A-Z]?\d+).*?([A-F][+-]?)(?=\s|\d)/ 
    const transcript = [];
    
    lines.forEach(line => {
        console.log('Processing line:', line);
        const csMatch = line.match(courseCompsciLine);
        const mathMatch = line.match(courseMathLine);
        const gradeMatch = line.match(gradeForCoursesWithLettersInNums);
        const cicsMatch = line.match(courseCICSLine);
        const englMatch = line.match(gradeForJrYearWriting);

        if(englMatch){
            if(csMatch[1] === '112'){
                transcript.push({
                    name: "ENGLWRIT112",
                    grade: gradeMatch[1]
            });
            }
        }
    
        if (csMatch) {
            if(csMatch[1] === '198'){
                transcript.push({
                    name: "CS198C",
                    grade: gradeMatch[1]
                });
            }

            else if(csMatch[1] === '186'){
                transcript.push({
                    name: "CS160",
                    grade: gradeMatch[1]
                });
            }

            else if(csMatch[1] === '187'){
                transcript.push({
                    name: "CS210",
                    grade: gradeMatch[1]
                });
            }

            else if(csMatch[1] === '121'){
                transcript.push({
                    name: "CS110",
                    grade: gradeMatch[1]
                });
            }
            
            else if(csMatch[1] === '490'){
                transcript.push({
                    name: "CS490Q",
                    grade: gradeMatch[1]
                });
            }
    
            else if(csMatch[1] === '590'){
                transcript.push({
                    name: "CS590X",
                    grade: gradeMatch[1]
                });
            }
    
            else if(csMatch[1] === '596'){
                transcript.push({
                    name: "CS596E",
                    grade: gradeMatch[1]
                });
            }
    
            else if(csMatch[1] === '690'){
                transcript.push({
                    name: "CS690K",
                    grade: gradeMatch[1]
                });
            }
    
            else{
            transcript.push({
                name: `CS${csMatch[1]}`,
                grade: csMatch[2]
            });
            }
        }

        if(cicsMatch){
            if(cicsMatch[1] === '291'){
                transcript.push({
                    name: "CICS91T",
                    grade: gradeMatch[1]
                });
            }

            else if(cicsMatch[1] === '298'){
                transcript.push({
                    name: "CICS298A",
                    grade: gradeMatch[1]
                });
            }
            
            else{
                transcript.push({
                    name: `CICS${csMatch[1]}`,
                    grade: csMatch[2]
                });
            }
        }
    
        if (mathMatch) {
            transcript.push({
                name: `MATH${mathMatch[1]}`,
                grade: mathMatch[2]
            });
        }
    });

     // Find the student and update them with the new transcript
     const updatedStudent = await Student.findOneAndUpdate(
        { username: username }, // find the student by their username
        { $push: { Transcript: { $each: transcript } } }, // push the new transcript data to the transcripts array
        { new: true } // return the updated document
    );

    if (updatedStudent) {
        res.json({ message: 'Transcript added successfully', student: updatedStudent });
    } else {
        res.status(404).send({ message: 'Student not found' });
    }
        
    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).send({ message: 'Failed to process upload' });
    }
};

module.exports = {
    extractTextFromPDF,
    uploadTranscript
};
