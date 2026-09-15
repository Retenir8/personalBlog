package work.foofish.course.data.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum Gender {
    MALE("男"),
    FEMALE("女"),
    UNKNOWN("未知");

    @EnumValue
    private final String value;

    Gender(String value) {
        this.value = value;
    }
}
