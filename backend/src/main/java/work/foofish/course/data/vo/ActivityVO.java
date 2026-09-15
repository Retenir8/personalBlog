package work.foofish.course.data.vo;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class ActivityVO {
    private Long activityId;
    private String title;
    private String summary;
    private OffsetDateTime activityDate;
    private String location;
    private String contactPhone;
    private Long publisherId;
    private String publisherName;
}
