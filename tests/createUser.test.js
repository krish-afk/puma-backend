//purpose is to test each aspect of the  Createuser function in the student.js controller. Numerous functions are mocked so we can
// ensure through unit testing that each one works on its own and together

// to run these tests make sure npm is installed
// make sure jest is installed as well: npm install --save-dev jest
// now type npm test -- tests/createUser.test.js into command line and hit enter
// to run all backend tests type npm test


const mongoose = require('mongoose');
const { createUser } = require('../controllers/students');



// This is a unit test just for the createUser function. This means to eliminate dependencies on other files and functions we used
// a mock constructor and a mock database. The goal is to ensure that when the create user function is called and given mock data
//that it sends the HTTP status code to `201 Created` whihc indicates a student has been successfully added to our database (201 is the common 
// server response to object creation). This status code confirms to the client that their request to create a new student was successful 
//and resulted in the creation of that resource on the server. To test this we then check our mock data base and find he correct object





// Mock the Student model so we dont need to interact with actual database
jest.mock('../models/student', () => {
    const mockStudentSchema = {
        save: jest.fn().mockResolvedValue({
            _id: '12345',
            Username: 'testUser',
            Password: 'pass123',
            SpireID: '001'
        })
    };
    return function() {
        return mockStudentSchema;
    };
});

describe('createUser', () => {
    it('creates a new student successfully', async () => {
        // simulates the HTTP request that would be received by controller function.
           //fields that you expect to receive from the client when they're trying to create a new student
        const req = {
            body: {
                SpireID: '001',
                Username: 'testUser',
                Password: 'pass123'
            }
        };
        //captures how the controller responds, mocking status and json shows what status code was set and what data was sent back
        const res = {
            status: jest.fn(() => res),
            json: jest.fn()
        };

        await createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(201); // status code we want sent 
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
            Username: 'testUser', 
            Password: 'pass123'
        }));
    });
});

