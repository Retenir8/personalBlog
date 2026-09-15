package work.foofish.course.data.vo;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCourseEnrollmentVO {

    @JsonProperty("enrollment_id")
    private Long enrollmentId;

    @JsonProperty("course_id")
    private Long courseId;

    private String title;

    @JsonProperty("class_time")
    private String classTime;

    private String location;

    private Integer status;

    private String imageUrl;
}
