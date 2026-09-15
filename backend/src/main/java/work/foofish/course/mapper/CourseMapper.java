package work.foofish.course.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import work.foofish.course.data.po.Course;

import java.util.List;

@Mapper
public interface CourseMapper extends BaseMapper<Course> {

    /**
     * 分页查询课程列表，附带已报名人数
     */
    @Select("""
            SELECT
                c.course_id,
                c.title,
                c.category,
                c.description,
                c.start_date,
                c.end_date,
                c.class_time,
                c.location,
                c.capacity,
                c.status,
                c.image_url,
                c.contact_phone,
                c.is_deleted,
                c.created_at,
                c.updated_at,
                COALESCE(ce.enrolled, 0) AS enrolled
            FROM courses c
            LEFT JOIN (
                SELECT course_id, COUNT(*) AS enrolled
                FROM course_enrollments
                GROUP BY course_id
            ) ce ON c.course_id = ce.course_id
            WHERE c.is_deleted = FALSE
            ORDER BY c.start_date, c.created_at DESC
            LIMIT #{limit}
            OFFSET #{offset}
            """)
    List<Course> pageCourses (@Param("offset") long offset, @Param("limit") long limit);

    /**
     * 根据课程 ID 查询课程详情及报名人数
     */
    @Select("""
            SELECT
                c.course_id,
                c.title,
                c.category,
                c.description,
                c.start_date,
                c.end_date,
                c.class_time,
                c.location,
                c.capacity,
                c.status,
                c.image_url,
                c.contact_phone,
                c.is_deleted,
                c.created_at,
                c.updated_at,
                COALESCE(ce.enrolled, 0) AS enrolled
            FROM courses c
            LEFT JOIN (
                SELECT course_id, COUNT(*) AS enrolled
                FROM course_enrollments
                GROUP BY course_id
            ) ce ON c.course_id = ce.course_id
            WHERE c.course_id = #{courseId}
              AND c.is_deleted = FALSE
            LIMIT 1
            """)
    Course getCourseWithEnrollment (@Param("courseId") Long courseId);

    /**
     * 根据分类或关键字查询课程
     */
    @Select("""
            <script>
            SELECT
                c.course_id,
                c.title,
                c.category,
                c.description,
                c.start_date,
                c.end_date,
                c.class_time,
                c.location,
                c.capacity,
                c.status,
                c.image_url,
                c.contact_phone,
                c.is_deleted,
                c.created_at,
                c.updated_at,
                COALESCE(ce.enrolled, 0) AS enrolled
            FROM courses c
            LEFT JOIN (
                SELECT course_id, COUNT(*) AS enrolled
                FROM course_enrollments
                GROUP BY course_id
            ) ce ON c.course_id = ce.course_id
            WHERE c.is_deleted = FALSE
            <if test="category != null and category != ''">
              AND c.category = #{category}
            </if>
            <if test="keyword != null and keyword != ''">
              AND (c.title ILIKE '%' || #{keyword} || '%' OR c.description ILIKE '%' || #{keyword} || '%')
            </if>
            ORDER BY c.start_date, c.created_at DESC
            LIMIT #{limit}
            OFFSET #{offset}
            </script>
            """)
    List<Course> searchCourses (@Param("category") String category,
                                @Param("keyword") String keyword,
                                @Param("offset") long offset,
                                @Param("limit") long limit);

    /**
     * 计算符合过滤条件的课程总数
     */
    @Select("""
            <script>
            SELECT COUNT(1)
            FROM courses c
            WHERE c.is_deleted = FALSE
            <if test="category != null and category != ''">
              AND c.category = #{category}
            </if>
            <if test="keyword != null and keyword != ''">
              AND (c.title ILIKE '%' || #{keyword} || '%' OR c.description ILIKE '%' || #{keyword} || '%')
            </if>
            </script>
            """)
    long countCourses (@Param("category") String category,
                       @Param("keyword") String keyword);
}
