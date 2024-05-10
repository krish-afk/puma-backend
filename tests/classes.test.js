const { getClasses } = require('../controllers/classes');
const Course = require('../models/course');
const httpMocks = require('node-mocks-http');

// to run this code do npm install
// in terminal type npm install --save-dev node-mocks-http 


//The purpose of this file is to test the classes.js controller. We mock several functiosn so that we can insure individual functions work correctrly
//by themselves in proper unit testing fashion. For this reason we have to mock the res and req parts of the HTTP interaction as shown in our tests



jest.mock('../models/course');  // Mock the Course model so we can do proper unit testing

function buildReq(overrides) {
    return httpMocks.createRequest({ ...overrides });
}

//
function buildRes() {
    return httpMocks.createResponse({
        eventEmitter: require('events').EventEmitter
    });
}

// If a course can be found we want to make sure it is being returned 
describe('getClasses', () => {
    it('should return a course if it is found', async () => {
        const req = buildReq({
            query: { course: 'intro_to_cs' }
        });
        const res = buildRes();
        const expectedCourse = { _id: '1', name: 'Intro to CS', searchName: 'intro_to_cs' };

        Course.findOne.mockResolvedValue(expectedCourse);

        await getClasses(req, res);

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual(expectedCourse);
        expect(Course.findOne).toHaveBeenCalledWith({ searchName: 'intro_to_cs' });
    });
});

it('should return 404 if no course is found', async () => {
    const req = buildReq({
        query: { course: 'non_existent_course' }
    });
    const res = buildRes();

    Course.findOne.mockResolvedValue(null);

    await getClasses(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ message: "Course not found" });
    expect(Course.findOne).toHaveBeenCalledWith({ searchName: 'non_existent_course' });
});

it('should handle errors and return status 500', async () => {
    const req = buildReq({
        query: { course: 'causes_error' }
    });
    const res = buildRes();

    Course.findOne.mockRejectedValue(new Error("Internal Server Error"));

    await getClasses(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ message: "Internal Server Error" });
});

