package work.foofish.course.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import work.foofish.course.data.dto.CourseEnrollmentRequest;
import work.foofish.course.data.enums.CourseStatus;
import work.foofish.course.data.po.Course;
import work.foofish.course.data.po.CourseEnrollment;
import work.foofish.course.data.vo.Result;
import work.foofish.course.exception.ForbiddenException;
import work.foofish.course.mapper.CourseEnrollmentMapper;
import work.foofish.course.mapper.CourseMapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EnrollmentServiceTests {

    @Mock
    private CourseEnrollmentMapper enrollmentMapper;

    @Mock
    private CourseMapper courseMapper;

    private EnrollmentService service;

    @BeforeEach
    void setUp() {
        service = new EnrollmentService(enrollmentMapper, courseMapper);
    }

    @Test
    void cancelsEnrollmentByEnrollmentId() {
        CourseEnrollment enrollment = CourseEnrollment.builder()
                .enrollmentId(73L)
                .userId(9L)
                .courseId(18L)
                .build();
        when(enrollmentMapper.selectById(73L)).thenReturn(enrollment);

        ResponseEntity<Result> response = service.cancelEnrollment(73L, "9", "user");

        assertEquals(200, response.getBody().getCode());
        verify(enrollmentMapper).deleteById(73L);
        verify(enrollmentMapper, never()).deleteById(18L);
    }

    @Test
    void rejectsCancellingAnotherUsersEnrollment() {
        CourseEnrollment enrollment = CourseEnrollment.builder()
                .enrollmentId(73L)
                .userId(9L)
                .courseId(18L)
                .build();
        when(enrollmentMapper.selectById(73L)).thenReturn(enrollment);

        assertThrows(ForbiddenException.class, () -> service.cancelEnrollment(73L, "10", "user"));
        verify(enrollmentMapper, never()).deleteById(any(Long.class));
    }

    @Test
    void rejectsDuplicateEnrollment() {
        CourseEnrollmentRequest request = new CourseEnrollmentRequest();
        request.setCourseId(18L);
        Course course = Course.builder()
                .courseId(18L)
                .capacity(20)
                .enrolled(1)
                .status(CourseStatus.IN_PROGRESS)
                .isDeleted(false)
                .build();
        when(courseMapper.getCourseWithEnrollment(18L)).thenReturn(course);
        when(enrollmentMapper.findByUserAndCourse(9L, 18L)).thenReturn(new CourseEnrollment());

        ResponseEntity<Result> response = service.enrollCourse("9", request);

        assertEquals(409, response.getBody().getCode());
        verify(enrollmentMapper, never()).insert(any(CourseEnrollment.class));
    }
}
