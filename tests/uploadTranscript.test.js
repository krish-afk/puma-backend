


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
  const { uploadTranscript, extractTextFromPDF } = require('../controllers/uploadTranscript');
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
