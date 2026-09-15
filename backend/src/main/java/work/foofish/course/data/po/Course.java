package work.foofish.course.data.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import work.foofish.course.data.enums.CourseStatus;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@TableName("courses")
public class Course {

    @TableId(value = "course_id", type = IdType.AUTO)
    private Long courseId;

    private String title;

    private String category;

    private String description;

    private LocalDate startDate;

    private LocalDate endDate;

    private String classTime;

    private String location;

    private Integer capacity;

    private CourseStatus status;

    private String imageUrl;

    private String contactPhone;

    private Boolean isDeleted;

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;

    @TableField(exist = false)
    private Integer enrolled;
}
