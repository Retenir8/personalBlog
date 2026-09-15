package work.foofish.course.data.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum Status {
    NORMAL(0),
    DISABLED(1);

    @EnumValue
    private final int value;

    Status(int value) {
        this.value = value;
    }
}
