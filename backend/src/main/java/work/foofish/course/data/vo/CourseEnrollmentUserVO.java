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
public class CourseEnrollmentUserVO {

    @JsonProperty("user_id")
    private Long userId;

    private String name;

    private String gender;

    @JsonProperty("avatar_url")
    private String avatarUrl;

    private String hobbies;

    @JsonProperty("health_condition")
    private String healthCondition;

    private Integer age;
}
