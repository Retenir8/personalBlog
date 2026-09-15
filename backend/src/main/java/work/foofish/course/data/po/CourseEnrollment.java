package work.foofish.course.data.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@TableName("course_enrollments")
public class CourseEnrollment {

    @TableId(value = "enrollment_id", type = IdType.AUTO)
    private Long enrollmentId;

    private Long userId;

    private Long courseId;

    private OffsetDateTime createdAt;
}
