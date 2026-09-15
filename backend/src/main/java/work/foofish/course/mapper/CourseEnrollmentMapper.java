package work.foofish.course.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import work.foofish.course.data.po.CourseEnrollment;
import work.foofish.course.data.vo.CourseEnrollmentUserVO;
import work.foofish.course.data.vo.UserCourseEnrollmentVO;

import java.util.List;

@Mapper
public interface CourseEnrollmentMapper extends BaseMapper<CourseEnrollment> {

    @Select("""
            SELECT enrollment_id, user_id, course_id, created_at
            FROM course_enrollments
            WHERE user_id = #{userId} AND course_id = #{courseId}
            LIMIT 1
            """)
    CourseEnrollment findByUserAndCourse (@Param("userId") Long userId,
                                          @Param("courseId") Long courseId);

    @Select("""
            SELECT
                ce.enrollment_id,
                ce.course_id,
                c.title,
                c.class_time,
                c.location,
                c.status,
                c.image_url
            FROM course_enrollments ce
            JOIN courses c ON ce.course_id = c.course_id
            WHERE ce.user_id = #{userId}
              AND c.is_deleted = FALSE
            ORDER BY ce.created_at DESC
            """)
    List<UserCourseEnrollmentVO> findCoursesByUser (@Param("userId") Long userId);

    @Select("""
            SELECT
                u.user_id,
                u.username AS name,
                u.gender,
                u.avatar_url,
                u.hobbies,
                u.health_condition,
                u.age
            FROM course_enrollments ce
            JOIN users u ON ce.user_id = u.user_id
            WHERE ce.course_id = #{courseId}
              AND (u.is_deleted = FALSE OR u.is_deleted IS NULL)
            ORDER BY ce.created_at ASC
            """)
    List<CourseEnrollmentUserVO> findUsersByCourse (@Param("courseId") Long courseId);

    @Select("""
            SELECT COUNT(1)
            FROM course_enrollments
            WHERE course_id = #{courseId}
            """)
    long countByCourseId (@Param("courseId") Long courseId);
}
