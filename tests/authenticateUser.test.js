//purpose is to test each aspect of the authenticate user function in the student.js controller. Numerous functions are mocked so we can
// ensure through unit testing that each one works on its own and together

// to run these tests make sure npm is installed
// make sure jest is installed as well: npm install --save-dev jest
// now type npm test -- tests/authenticateUser.test.js into command line and hit enter
// to run all backend tests type npm test



const Student = require('../models/student');
const { authenticateUser } = require('../controllers/students');



//uses mock student constructors for each test and mock student objects to reflect a database. Then tests each outcome outlines in
// the students.js controller (404 if the username does not exist in the database, 401 if it is an incorrect password and 200 if the username and 
//password match our mocked student data)

jest.mock('../models/student', () => ({
    findOne: jest.fn()
  }));

  beforeEach(() => {
    jest.resetAllMocks();  // Resets the state of all mocks
    Student.findOne = jest.fn();  // Re-initialize the mock for findOne before each test
});

afterEach(() => {
    jest.resetAllMocks();
  });


  it('should return 404 if the user is not found', async () => {
    const req = {
      body: { username: 'nonexistent', password: 'password123' }
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn()
    };
  
    Student.findOne.mockResolvedValue(null);
  
    await authenticateUser(req, res);
  
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Student not found' });
  });

  
  it('should return 401 if the password is incorrect', async () => {
    const req = {
      body: { username: 'testUser', password: 'wrongPassword' }
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn()
    };
  
    // Mocking Student.findOne to simulate finding a user but with a different password
    Student.findOne.mockResolvedValue({ Username: 'testUser', Password: 'correctPassword' });
  
    await authenticateUser(req, res);
  
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Incorrect Password' });
  });



  it('should authenticate successfully with correct credentials', async () => {
    const req = {
      body: { username: 'testUser', password: 'correctPassword' }
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn()
    };
  
    Student.findOne.mockResolvedValue({ Username: 'testUser', Password: 'correctPassword' });
  
    await authenticateUser(req, res);
  
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authenticated!' });
  });
  