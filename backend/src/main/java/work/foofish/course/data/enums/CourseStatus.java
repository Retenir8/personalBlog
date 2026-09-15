package work.foofish.course.data.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum CourseStatus {
    NOT_STARTED(0),
    IN_PROGRESS(1),
    COMPLETED(2);

    @EnumValue
    private final int value;

    CourseStatus (int value) {
        this.value = value;
    }
}
