package work.foofish.course.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import work.foofish.course.annotation.Auth;
import work.foofish.course.data.dto.CourseEnrollmentRequest;
import work.foofish.course.data.enums.Role;
import work.foofish.course.data.vo.Result;
import work.foofish.course.service.EnrollmentService;

@CrossOrigin
@RestController
@RequestMapping("/api")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController (EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @Auth
    @PostMapping("/enroll")
    public ResponseEntity<Result> enrollCourse (@Valid @RequestBody CourseEnrollmentRequest request,
                                                HttpServletRequest httpRequest) {
        String currentUserId = (String) httpRequest.getAttribute("userId");
        return enrollmentService.enrollCourse(currentUserId, request);
    }

    @Auth
    @DeleteMapping("/enroll/{enrollmentId}")
    public ResponseEntity<Result> cancelEnrollment (@PathVariable Long enrollmentId,
                                                    HttpServletRequest httpRequest) {
        String currentUserId = (String) httpRequest.getAttribute("userId");
        String currentRole = (String) httpRequest.getAttribute("role");
        return enrollmentService.cancelEnrollment(enrollmentId, currentUserId, currentRole);
    }

    @Auth
    @GetMapping("/enroll/user/{userId}")
    public ResponseEntity<Result> listUserEnrollments (@PathVariable("userId") Long userId,
                                                       HttpServletRequest httpRequest) {
        String currentUserId = (String) httpRequest.getAttribute("userId");
        String currentRole = (String) httpRequest.getAttribute("role");
        return enrollmentService.listUserEnrollments(userId, currentUserId, currentRole);
    }

    @Auth(roles = {Role.ADMIN, Role.TEACHER})
    @GetMapping("/enroll/course/{courseId}")
    public ResponseEntity<Result> listCourseEnrollments (@PathVariable("courseId") Long courseId) {
        return enrollmentService.listCourseEnrollments(courseId);
    }
}
