package work.foofish.course.data.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("care_records")
public class CareRecord {
    @TableId(value = "record_id", type = IdType.AUTO)
    private Long recordId;
    private Long userId;
    private Long recorderId;
    private String physicalStatus;
    private String mentalStatus;
    private String checkDetails;
    private OffsetDateTime checkedAt;
    private String advice;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
