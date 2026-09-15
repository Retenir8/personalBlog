package work.foofish.course.data.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CourseCreateRequest {

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
}
