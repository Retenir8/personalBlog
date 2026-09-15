package work.foofish.course.service;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import work.foofish.course.data.dto.CourseEnrollmentRequest;
import work.foofish.course.data.enums.CourseStatus;
import work.foofish.course.data.enums.Role;
import work.foofish.course.data.po.Course;
import work.foofish.course.data.po.CourseEnrollment;
import work.foofish.course.data.vo.CourseEnrollmentUserVO;
import work.foofish.course.data.vo.Result;
import work.foofish.course.data.vo.UserCourseEnrollmentVO;
import work.foofish.course.exception.ForbiddenException;
import work.foofish.course.mapper.CourseEnrollmentMapper;
import work.foofish.course.mapper.CourseMapper;

import java.util.List;
import java.util.Map;

@Service
public class EnrollmentService {

    private final CourseEnrollmentMapper courseEnrollmentMapper;
    private final CourseMapper courseMapper;

    public EnrollmentService (CourseEnrollmentMapper courseEnrollmentMapper,
                              CourseMapper courseMapper) {
        this.courseEnrollmentMapper = courseEnrollmentMapper;
        this.courseMapper = courseMapper;
    }

    public ResponseEntity<Result> enrollCourse (String currentUserId, CourseEnrollmentRequest request) {
        if (request == null || request.getCourseId() == null) {
            return Result.error(400, "course_id不能为空");
        }
        Long userId = parseUserId(currentUserId);
        Long courseId = request.getCourseId();

        Course course = courseMapper.getCourseWithEnrollment(courseId);
        if (course == null || Boolean.TRUE.equals(course.getIsDeleted())) {
            return Result.error(404, "课程不存在");
        }

        if (course.getStatus() == CourseStatus.COMPLETED) {
            return Result.error(400, "课程已结课，无法报名");
        }

        CourseEnrollment existing = courseEnrollmentMapper.findByUserAndCourse(userId, courseId);
        if (existing != null) {
            return Result.error(409, "已报名该课程");
        }

        int enrolled = course.getEnrolled() == null ? 0 : course.getEnrolled();
        if (enrolled >= course.getCapacity()) {
            return Result.error(400, "课程已满");
        }

        CourseEnrollment enrollment = CourseEnrollment.builder()
                .userId(userId)
                .courseId(courseId)
                .build();
        courseEnrollmentMapper.insert(enrollment);

        return Result.success(Map.of("enrollment_id", enrollment.getEnrollmentId()), "报名成功");
    }

    public ResponseEntity<Result> cancelEnrollment (Long enrollmentId, String currentUserId, String currentRole) {
        CourseEnrollment enrollment = courseEnrollmentMapper.selectById(enrollmentId);
        if (enrollment == null) {
            return Result.error(404, "报名记录不存在");
        }

        Long currentId = parseUserId(currentUserId);
        boolean isAdmin = Role.ADMIN.getValue().equals(currentRole);
        if (!isAdmin && !enrollment.getUserId().equals(currentId)) {
            throw new ForbiddenException("无权取消他人报名");
        }

        courseEnrollmentMapper.deleteById(enrollmentId);
        return Result.success(null, "取消报名成功");
    }

    public ResponseEntity<Result> listUserEnrollments (Long targetUserId, String currentUserId, String currentRole) {
        Long currentId = parseUserId(currentUserId);
        boolean isAdmin = Role.ADMIN.getValue().equals(currentRole);
        if (!isAdmin && !targetUserId.equals(currentId)) {
            throw new ForbiddenException("无权查看他人报名信息");
        }

        List<UserCourseEnrollmentVO> list = courseEnrollmentMapper.findCoursesByUser(targetUserId);
        return Result.success(list, "获取报名课程成功");
    }

    public ResponseEntity<Result> listCourseEnrollments (Long courseId) {
        Course course = courseMapper.selectById(courseId);
        if (course == null || Boolean.TRUE.equals(course.getIsDeleted())) {
            return Result.error(404, "课程不存在");
        }

        List<CourseEnrollmentUserVO> list = courseEnrollmentMapper.findUsersByCourse(courseId);
        return Result.success(list, "获取课程报名名单成功");
    }

    private Long parseUserId (String userId) {
        if (!StringUtils.hasText(userId)) {
            throw new IllegalArgumentException("当前用户未登录");
        }
        return Long.parseLong(userId);
    }
}
