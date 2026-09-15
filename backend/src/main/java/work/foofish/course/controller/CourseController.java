package work.foofish.course.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import work.foofish.course.annotation.Auth;
import work.foofish.course.data.dto.CourseCreateRequest;
import work.foofish.course.data.dto.CourseUpdateRequest;
import work.foofish.course.data.enums.Role;
import work.foofish.course.data.vo.Result;
import work.foofish.course.service.CourseService;

@CrossOrigin
@RestController
@RequestMapping("/api")
public class CourseController {

    private final CourseService courseService;

    public CourseController (CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping("/courses")
    public ResponseEntity<Result> listCourses (@RequestParam(required = false) String category,
                                               @RequestParam(required = false) String keyword,
                                               @RequestParam(required = false) Integer page,
                                               @RequestParam(required = false, name = "pageSize") Integer pageSize,
                                               @RequestParam(required = false, name = "page_size") Integer pageSizeSnake) {
        Integer size = pageSize != null ? pageSize : pageSizeSnake;
        return courseService.listCourses(category, keyword, page, size);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<Result> getCourse (@PathVariable Long courseId) {
        return courseService.getCourseDetail(courseId);
    }

    @Auth(roles = {Role.ADMIN, Role.TEACHER})
    @PostMapping("/course")
    public ResponseEntity<Result> createCourse (@RequestBody CourseCreateRequest request) {
        return courseService.createCourse(request);
    }

    @Auth(roles = {Role.ADMIN, Role.TEACHER})
    @PutMapping("/course/{courseId}")
    public ResponseEntity<Result> updateCourse (@PathVariable Long courseId,
                                                @RequestBody CourseUpdateRequest request) {
        return courseService.updateCourse(courseId, request);
    }

    @Auth(roles = {Role.ADMIN, Role.TEACHER})
    @DeleteMapping("/course/{courseId}")
    public ResponseEntity<Result> deleteCourse (@PathVariable Long courseId) {
        return courseService.deleteCourse(courseId);
    }
}
