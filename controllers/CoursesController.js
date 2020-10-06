const Repository = require('../models/Repository');

module.exports = 
class CoursesController extends require('./Controller') {
    constructor(req, res){
        super(req, res);
        this.coursesRepository = new Repository('Courses');
    }
    get(id){
        if(!isNaN(id))
            this.response.JSON(this.coursesRepository.get(id));
        else
            this.response.JSON(this.coursesRepository.getAll());
    }
    courseAlreadyExists(title) {
        let courses = this.coursesRepository.getAll();
        for(let i = 0; i < courses.length; i++) {
            if(courses[i].Title === title)
                return true;
        }
        return false;
    }
    courseAlreadyExistsPut(course) {
        let courses = this.coursesRepository.getAll();
        for(let i = 0; i < courses.length; i++) {
            if(course.Id !== courses[i].Id)
                if(courses[i].Title === course.Title)
                    return true;
        }
        return false;
    }
    post(course){  
        if((course.Title === "" || course.Title === undefined) || (course.Code === "" || course.Code === undefined)) {
            this.response.badRequest();
        }
        else if(this.courseAlreadyExists(course)) {
            this.response.conflict();
        }
        else {
            this.response.created(JSON.stringify(this.coursesRepository.add(course)));
        }
    }
    put(course){
        if((course.Title === "" || course.Title === undefined) || (course.Code === "" || course.Code === undefined)) {
                this.response.badRequest();
        }
        else if(this.courseAlreadyExistsPut(course)) {
            this.response.conflict();
        }
        else {
            if (this.coursesRepository.update(course))
                this.response.ok();
            else 
                this.response.notFound();
        }
    }
    remove(id){
        if (this.coursesRepository.remove(id))
            this.response.accepted();
        else
            this.response.notFound();
    }
}