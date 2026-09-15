package work.foofish.course.data.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CourseEnrollmentRequest {

    @JsonProperty("course_id")
    @NotNull
    private Long courseId;
}
