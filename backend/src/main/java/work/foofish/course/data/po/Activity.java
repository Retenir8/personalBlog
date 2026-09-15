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
@TableName("activities")
public class Activity {
    @TableId(value = "activity_id", type = IdType.AUTO)
    private Long activityId;
    private String title;
    private String summary;
    private OffsetDateTime activityDate;
    private String location;
    private String contactPhone;
    private Long publisherId;
    private Boolean isPublished;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
