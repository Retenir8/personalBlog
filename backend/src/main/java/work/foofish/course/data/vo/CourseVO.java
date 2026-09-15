package work.foofish.course.data.vo;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import work.foofish.course.data.enums.CourseStatus;
import work.foofish.course.data.po.Course;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseVO {

    @JsonProperty("course_id")
    private Long courseId;

    private String title;

    private String category;

    private String description;

    @JsonProperty("start_date")
    private LocalDate startDate;

    @JsonProperty("end_date")
    private LocalDate endDate;

    @JsonProperty("class_time")
    private String classTime;

    private String location;

    private Integer capacity;

    private Integer status;

    @JsonProperty("image_url")
    private String imageUrl;

    @JsonProperty("contact_phone")
    private String contactPhone;

    private Integer enrolled;

    @JsonProperty("created_at")
    private OffsetDateTime createdAt;

    @JsonProperty("updated_at")
    private OffsetDateTime updatedAt;

    public static CourseVO fromEntity (Course course) {
        if (course == null) {
            return null;
        }
        CourseStatus status = course.getStatus();
        return CourseVO.builder()
                .courseId(course.getCourseId())
                .title(course.getTitle())
                .category(course.getCategory())
                .description(course.getDescription())
                .startDate(course.getStartDate())
                .endDate(course.getEndDate())
                .classTime(course.getClassTime())
                .location(course.getLocation())
                .capacity(course.getCapacity())
                .status(status != null ? status.getValue() : null)
                .imageUrl(course.getImageUrl())
                .contactPhone(course.getContactPhone())
                .enrolled(course.getEnrolled())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }
}
