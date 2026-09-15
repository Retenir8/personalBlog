package work.foofish.course.data.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

/**
 * 用户角色枚举
 * 枚举值必须与数据库 CHECK 约束一致。
 */
@Getter
public enum Role {
    USER("user"),
    TEACHER("teacher"),
    CAREGIVER("caregiver"),
    ADMIN("admin");

    @EnumValue
    @JsonValue
    private final String value;

    Role(String value) {
        this.value = value;
    }
}
