package work.foofish.course.data.vo;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class CareRecordVO {
    private Long recordId;
    private Long userId;
    private String elderName;
    private Long recorderId;
    private String recorderName;
    private String physicalStatus;
    private String mentalStatus;
    private String checkDetails;
    private OffsetDateTime checkedAt;
    private String advice;
    private OffsetDateTime createdAt;
}
