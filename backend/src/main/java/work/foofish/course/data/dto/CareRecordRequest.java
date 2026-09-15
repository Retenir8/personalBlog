package work.foofish.course.data.dto;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class CareRecordRequest {
    private Long userId;
    private String physicalStatus;
    private String mentalStatus;
    private String checkDetails;
    private OffsetDateTime checkedAt;
    private String advice;
}
