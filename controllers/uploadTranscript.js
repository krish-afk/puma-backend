const multer = require('multer');
const pdfParse = require('pdf-parse');
const Student = require('../models/student.js');

const extractTextFromPDF = async (fileBuffer) => {
    try {
        const data = await pdfParse(fileBuffer);
        return data.text;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        return null;
    }
};

const uploadTranscript = async (req, res) => {
    // username is now part of the form data, not URL parameters
    console.log("Request received for uploading transcript");
    if (!req.file) {
        console.log("No file uploaded");
        return res.status(400).send({ message: 'No file was uploaded.' });
    }

    const fileBuffer = req.file.buffer;
    const username = req.body.username;

    console.log(`Received file for user: ${username}, file size: ${req.file.size} bytes`);

    if (!fileBuffer) {
        console.log("File buffer is empty");
        return res.status(400).send({ message: 'Please upload a file.' });
    }

    console.log(`Processing upload for user: ${username}`);

    try {
        console.log("Starting PDF text extraction");
        const text = await extractTextFromPDF(fileBuffer);

        if (!text) {
            console.log("No text extracted from PDF");
            return res.status(500).send({ message: 'Could not extract text from PDF' });
        }

        // Process the extracted text to find course names and grades
        const transcript = processTranscript(text);

        // Find the student and update them with the new transcript
        const updatedStudent = await Student.findOneAndUpdate(
            { Username: username },
            { $set: { Transcript: transcript } },
            { new: true }
        );

        if (updatedStudent) {
            console.log(`Transcript added successfully for user: ${username}`);
            res.json({ message: 'Transcript added successfully', student: updatedStudent });
        } else {
            console.log(`Student not found: ${username}`);
            res.status(404).send({ message: 'Student not found: ' + username });
        }
        
    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).send({ message: 'Failed to process upload' });
    }
};

function processTranscript(text) {
    console.log("Starting transcript processing");
    const lines = text.split('\n');
    const transcript = [];

    const courseCompsciLine = /COMPSCI\s+([A-Z]?\d+).*?([A-F][+-]?)(?=\s|\d)/;
    const courseCICSLine = /CICS\s+([A-Z]?\d+).*?([A-F][+-]?)(?=\s|\d)/;
    const courseMathLine = /MATH\s+([A-Z]?\d+).*?([A-F][+-]?)(?=\s|\d)/;
    const gradeForCoursesWithLettersInNums = /\d+\.\d+([A-Z])\d+\.\d+/;
    const gradeForJrYearWriting = /ENGLWRIT\s+([A-Z]?\d+).*?([A-F][+-]?)(?=\s|\d)/;

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

    console.log("Transcript processing completed");
    return transcript;
}

module.exports = {
    extractTextFromPDF,
    uploadTranscript
};

