package work.foofish.course.data.dto;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class ActivityRequest {
    private String title;
    private String summary;
    private OffsetDateTime activityDate;
    private String location;
    private String contactPhone;
}
