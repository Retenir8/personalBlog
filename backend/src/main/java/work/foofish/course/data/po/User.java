package work.foofish.course.data.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import work.foofish.course.data.enums.Gender;
import work.foofish.course.data.enums.Role;
import work.foofish.course.data.enums.Status;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * 用户实体类
 * 对应数据库 users 表
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@TableName("users")
public class User {
    @TableId(value = "user_id", type = IdType.AUTO)
    private Long userId;

    private String username;

    private String passwordHash;

    private Gender gender;

    private LocalDate dateOfBirth;

    private String phone;

    private String avatarUrl;

    private String hobbies;

    private String healthCondition;

    private Integer age;

    // PostgreSQL TIMESTAMPTZ 类型需要使用 OffsetDateTime
    private OffsetDateTime lastLoginAt;

    private Status status;

    private Role role;

    private Boolean isDeleted;

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;
}
