
// this is a mock student in the database. Instead of interacting with mongodb we mock the calls to find one and update to return this mocked student object
jest.mock('../models/student', () => ({
  findOneAndUpdate: jest.fn().mockResolvedValue({ 
    _id: '123',
    username: 'testuser',
    transcript: [{ name: 'COMPSCI220', grade: 'A' }]
  })
}));

//instead of actually using pdf-parse and needing to pass it in a file we return a mocked version of what it would output
jest.mock('pdf-parse', () => ({ 
  __esModule: true, // This might be necessary if your module uses ES6 imports
  default: jest.fn(() => Promise.resolve({ text: "This is some PDF text." }))
}));


  // imports the modules we are testing
  const { uploadTranscript, extractTextFromPDF, processTranscript} = require('../controllers/uploadTranscript');
  const Student = require('../models/student');
  const pdfParse = require('pdf-parse');

  
//mocks uploadTranscript with its own actual implementation but useful in future if needing to mock specific func in uploadTranscript
  jest.mock('../controllers/uploadTranscript', () => ({
    ...jest.requireActual('../controllers/uploadTranscript')
  }));
  


// Helper to create mock request which mimic's express's "req" object structure and allows us to simulate HTTP requests
const mockRequest = (file, body) => {
    return {
        file,
        body: body !== undefined ? body : {}  
    };
};

// Helper to create mock response mimics express's "res" object structure
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('uploadTranscript', () => {
  beforeEach(() => {
    jest.clearAllMocks();  // Clear mocks between tests
    pdfParse.default.mockImplementation(() => Promise.resolve({ text: "This is some PDF text." }));
  });


  it('should handle empty file buffer', async () => {
    const req = mockRequest({
      file: { buffer: Buffer.from('') } // creates a file object with field buffer that uses Buffer method to make empty buffer
    }, {
      username: 'testuser'
    });
    const res = mockResponse();
    
    await uploadTranscript(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: 'Please upload a file.' });
  });




  test('should send a 400 error if no file is uploaded', async () => {
    const req = mockRequest(null, { username: 'testuser' }); // the file is null here so no file is being passed
    const res = mockResponse();

    await uploadTranscript(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: 'No file was uploaded.' });
  });




it('should return an error if username is missing', async () => {
    const req = mockRequest({
        file: { buffer: Buffer.from('Some PDF content') },
        body: {}  // Username is missing
    });
    const res = mockResponse();

    await uploadTranscript(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: 'Username is missing' });
});


it('should return extracted text when pdfParse is successful', async () => {
  const result = await extractTextFromPDF(Buffer.from("dummy content")); //simulates binary data from the parse buffer, doesnt matter what the content is because pdf-parse is mocked
  expect(result).toBe("This is some PDF text."); // Update this to match the mock return value
  expect(pdfParse.default).toHaveBeenCalledWith(expect.any(Buffer)); // Ensure it was called with a Buffer
});


it('should handle errors from pdfParse when not successful', async () => {
  
  //allows test to monitor calls to console.error without performing its standard action (which is to print the error to the console) 
  //and replaces the original implementation with a function that does nothing

  jest.spyOn(console, 'error').mockImplementation(() => {});

  //this is a mock used only once for pdfParse to simulate what would happen if pdf-parse threw an error in transcriptUpload
  // the Promise.reject(new Error("Failed to parse PDF")) is an example of a promise being rejected and a possible error that could eb thrown with it
  pdfParse.default.mockImplementationOnce(() => Promise.reject(new Error("Failed to parse PDF")));

  const buffer = Buffer.from("dummy PDF data"); // simulates binary data from the parse buffer but does'nt matter because it'll reject here anyways
  const text = await extractTextFromPDF(buffer); //using the data it calls extract text from pdf which uses default pdfParse
  expect(text).toBeNull(); // after error should return null
  expect(console.error).toHaveBeenCalledWith('Error extracting text from PDF:', expect.any(Error)); //checks console.error was called with a specific error
});

});


describe('processTranscript', () => {
  it('should correctly parse one correctly formatted CS class', () => {
    const text = `"COMPSCI 220 Programming Methodology       4.000  4.0000 A    14.800" `;
    const expected = [
      { name: 'CS220', grade: 'A' }
    ];
    expect(processTranscript(text)).toEqual(expected);
  });

  it('should correctly parse well-formed transcript with multiple correclty formatted classes just CS', () => {
    const text = `COMPSCI 220 Programming Methodology       4.000  4.0000 A    14.800 
    COMPSCI 321 Fake Class 4.000 4.0000 B-  15.7000 
    COMPSCI 256  Fake Class Test  3.000 3.000 F 35.670 
    COMPSCI 240 Reasoning Under Uncertainty  2.000 4.000 C+ 15.000 " `;
    const expected = [
      { name: 'CS220', grade: 'A' },
      { name: 'CS321', grade: 'B-'},
      { name: 'CS256', grade: 'F' },
      { name: 'CS240', grade: 'C+' }
    ];
    expect(processTranscript(text)).toEqual(expected);
  });

  it('should correctly parse well-formed transcript with multiple correctly formatted classes just with grades A-F', () => {
    const text = `MATH 235 Linear Algebra      4.000  4.0000   D-  14.800 
    MATH 323 Fake Class 4.000 4.0000 A+  15.7000 
    MATH 311 Fake Math Class  3.000 3.000 A- 35.670 
    MATH 158 Blah Blah  2.000 4.000 B  15.000 `;
    const expected = [
      { name: 'MATH235', grade: 'D-' },
      { name: 'MATH323', grade: 'A+'},
      { name: 'MATH311', grade: 'A-' },
      { name: 'MATH158', grade: 'B' }
    ];
    
    const actual = processTranscript(text);
    console.log("Processed Output:", actual);
    expect(actual).toEqual(expected);
  });

  it('should capture course with grade P for pass', () => {
    const text = `MATH 235 Linear Algebra      4.000  4.0000   P  14.800 
      COMPSCI 321 Fake Class 4.000 4.0000 P  15.7000  `;

    const expected = [
      { name: 'MATH235', grade: 'P' },
      { name: 'CS321', grade: 'P'}
    ];
  
    const actual = processTranscript(text);
    console.log("Processed Output:", actual);
    expect(actual).toEqual(expected);
  });
});

  describe('processTranscript with special CS course handling', () => {
    it('should handle CS198C with its unique naming and grading', () => {
      const text = `COMPSCI 198C Introduction to Computer Science     4.000 4.000 A 16.000`;
      const expected = [{ name: 'CS198C', grade: 'A' }];
      const actual = processTranscript(text);
      console.log("Processed Output:", actual);
      expect(processTranscript(text)).toEqual(expected);
    });
  
    it('should handle replace COMPSCI 186 with CICS 160', () => {
      const text = `COMPSCI 186 Data Structures    3.000 3.000 B+ 10.000`;
      const expected = [{ name: 'CICS160', grade: 'B+' }];
      const actual = processTranscript(text);
      console.log("Processed Output:", actual);
      expect(processTranscript(text)).toEqual(expected);
    });
  
    it('should replace  CS187 with CICS210', () => {
      const text = `COMPSCI 187 Algorithms   4.000 4.000 C- 12.000`;
      const expected = [{ name: 'CICS210', grade: 'C-' }];
      const actual = processTranscript(text);
      console.log("Processed Output:", actual);
      expect(processTranscript(text)).toEqual(expected);
    });
  
    it('should replace CS121  CICS 110', () => {
      const text = `COMPSCI 121 Introduction to Problem Solving with Computers 3.000 3.000 A- 9.000`;
      const expected = [{ name: 'CICS110', grade: 'A-' }];
      const actual = processTranscript(text);
      console.log("Processed Output:", actual);
      expect(processTranscript(text)).toEqual(expected);
    });

    it('should handle CS490Q for CS490 with its unique naming', () => {
      const text = `COMPSCI 490Q Special Topics in Computer Science 2.000 2.000 B 8.000`;
      const expected = [{ name: 'CS490Q', grade: 'B' }];
      expect(processTranscript(text)).toEqual(expected);
    });

    it('should correctly handle CS590 with custom naming and grade mapping', () => {
      const text = `COMPSCI 590 Advanced Computer Topics    3.000 3.000 B+ 12.000`;
      const expected = [{ name: 'CS590X', grade: 'B+' }];
      expect(processTranscript(text)).toEqual(expected);
    });
  
    it('should correctly handle CS596 with custom naming and grade mapping', () => {
      const text = `COMPSCI 596 Special Topics in CS   2.000 2.000 A- 8.000`;
      const expected = [{ name: 'CS596E', grade: 'A-' }];
      expect(processTranscript(text)).toEqual(expected);
    });
  
    it('should correctly handle CS690 with custom naming and grade mapping', () => {
      const text = `COMPSCI 690 Thesis Research  4.000 4.000 A 16.000`;
      const actual = processTranscript(text);
      console.log("Processed Output:", actual);
      const expected = [{ name: 'CS690K', grade: 'A' }];

      expect(processTranscript(text)).toEqual(expected);
    });
  });
  

describe('processTranscript with CICS course handling', () => {
  it('should correctly handle CICS291T so that the T is included in the name and dealt with', () => {
    const text = `CICS 291 Special Topics    3.000 3.000 A- 12.000`;
    const expected = [{ name: 'CICS91T', grade: 'A-' }];
    expect(processTranscript(text)).toEqual(expected);
  });

  it('should skip CICS191FY1 as specified', () => {
    const text = `CICS 191FY1 Introductory Special Topics   4.000 4.000 B+ 16.000`;
    const expected = [];  // Since the function is supposed to skip this course
    expect(processTranscript(text)).toEqual(expected);
  });

  it('should correctly handle CICS298 so the A is added and the grades are dealt with', () => {
    const text = `CICS 298 Advanced Topics    2.000 2.000 C+ 8.000`;
    const expected = [{ name: 'CICS298A', grade: 'C+' }];
    expect(processTranscript(text)).toEqual(expected);
  });

  it('should correctly handle general CICS courses with their standard course code and grade', () => {
    const text = `CICS 102 Introduction to Information Technology  3.000 3.000 A 9.000`;
    const expected = [{ name: 'CICS102', grade: 'A' }];
    expect(processTranscript(text)).toEqual(expected);
  });
});

describe('processTranscript for ENGLWRIT courses', () => {
  it('should correctly handle only english class: ENGLWRIT112', () => {
    const text = `ENGLWRIT 112 Composition    3.000 3.000 A- 9.000`;
    const expected = [{ name: 'ENGLWRIT112', grade: 'A-' }];
    expect(processTranscript(text)).toEqual(expected);
  });
});

describe('processTranscript with ENGLWRIT course handling', () => {
  it('should ignore other English classes that are not specifically handled', () => {
    const text = `
      ENGLWRIT 113 Academic Writing    3.000 3.000 A- 9.000
      ENGLWRIT 112 Composition        3.000 3.000 B+ 9.000
      ENGLWRIT 101 Intro to Writing   3.000 3.000 C  9.000
      ENGLISH 210 Literature Survey   3.000 3.000 B  9.000
    `;
    const expected = [
      { name: 'ENGLWRIT112', grade: 'B+' } // Assuming this is the course we want to process
    ];

    const result = processTranscript(text);
    expect(result).toEqual(expect.arrayContaining(expected));
  });
});



describe('Full integration of uploadTranscript process', () => {
  it('should successfully extract, process, and update a transcript', async () => {
    // Setup mock request with a valid PDF buffer and username
    const pdfContent = "COMPSCI 220 Programming Methodology 4.000 4.000 A 14.800 COMPSCI 321 Fake Class 4.000 4.0000 B- 15.7000";
    const req = mockRequest({ buffer: Buffer.from(pdfContent) }, { username: 'testuser' });
    const res = mockResponse();

    // Set up mocks
    pdfParse.default.mockImplementation(() => Promise.resolve({ text: pdfContent }));
    Student.findOneAndUpdate.mockResolvedValue({
      _id: '123',
      username: 'testuser',
      transcript: [
        { name: 'CS220', grade: 'A' },
        { name: 'CS321', grade: 'B-' }
      ]
    });

    // Execute the function
    await uploadTranscript(req, res);

    // Verify that the text was extracted and processed
    expect(pdfParse.default).toHaveBeenCalledWith(expect.any(Buffer));
    expect(Student.findOneAndUpdate).toHaveBeenCalledWith(
      { Username: 'testuser' },
      { $set: { Transcript: expect.any(Array) } },
      { new: true }
    );

    // Check the response for success message
    expect(res.json).toHaveBeenCalledWith({
      message: 'Transcript added successfully',
      student: expect.any(Object)
    });
  });
});

describe('Full integration of uploadTranscript with diverse courses', () => {
  it('should correctly handle a complex mix of courses, including special cases and various departments', async () => {
    const pdfContent = `
      HISTORY 101 World History       3.000 3.000 B  9.000
      PHILOS 220 Ethics in Technology  3.000 3.000 A- 9.000
      COMPSCI 198C Introduction to Computer Science 4.000 4.000 A 16.000
      COMPSCI 186 Data Structures 3.000 3.000 B+ 9.000
      COMPSCI 187 Algorithms 4.000 4.000 C- 12.000
      COMPSCI 121 Introduction to Problem Solving with Computers 3.000 3.000 A- 9.000
      MATH 158 Differential Equations 4.000 4.000 P 16.000
      MATH 235 Linear Algebra 4.000 4.000 B- 12.000
      ENGLWRIT 113 Academic Writing 3.000 3.000 A 9.000
      COMPSCI 490Q Special Topics in Computer Science 2.000 2.000 B 8.000
      COMPSCI 590 Advanced Computer Topics 3.000 3.000 B+ 12.000
      COMPSCI 596 Special Topics in CS 2.000 2.000 A- 8.000
      COMPSCI 690 Thesis Research 4.000 4.000 A 16.000
    `;
    const req = mockRequest({ buffer: Buffer.from(pdfContent) }, { username: 'testuser' });
    const res = mockResponse();

    // Setup mocks
    pdfParse.default.mockImplementation(() => Promise.resolve({ text: pdfContent }));
    Student.findOneAndUpdate.mockResolvedValue({
      _id: '123',
      username: 'testuser',
      transcript: expect.any(Array)
    });

    // Execute the function
    await uploadTranscript(req, res);

    // Verify that the text was extracted and processed
    expect(pdfParse.default).toHaveBeenCalledWith(expect.any(Buffer));
    expect(Student.findOneAndUpdate).toHaveBeenCalledWith(
      { Username: 'testuser' },
      { $set: { Transcript: expect.any(Array) } },
      { new: true }
    );

    // Check the response for success message
    expect(res.json).toHaveBeenCalledWith({
      message: 'Transcript added successfully',
      student: expect.any(Object)
    });
  });
});






