package work.foofish.course.data.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import work.foofish.course.data.enums.Gender;
import work.foofish.course.data.enums.Role;
import work.foofish.course.data.po.User;

/**
 * 用户信息 DTO
 * 用于用户信息的查询和展示
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {

    private Long userId;
    
    private String name;
    
    private String gender;
    
//    @JsonProperty("date_of_birth")
//    private LocalDate dateOfBirth;
    
//    private String phone;

    private Role role;

    private String avatarUrl;
    
    private String hobbies;

    private String healthCondition;

    private Integer age;

    /**
     * 从 User PO 转换为 UserDTO
     * 返回中文值给前端（"男"/"女"/"未知"）
     *
     * @param user 用户实体
     * @return UserDTO
     */
    public static UserDTO fromUser(User user) {
        if (user == null) {
            return null;
        }
        return UserDTO.builder()
                .userId(user.getUserId())
                .name(user.getUsername())
                .gender(user.getGender() != null ? user.getGender().getValue() : null)
//                .dateOfBirth(user.getDateOfBirth())
//                .phone(user.getPhone())
                .role(user.getRole() != null ? user.getRole() : Role.USER)
                .avatarUrl(user.getAvatarUrl())
                .hobbies(user.getHobbies())
                .healthCondition(user.getHealthCondition())
                .age(user.getAge())
                .build();
    }

    /**
     * 将 UserDTO 转换为 User 实体
     *
     * @param userDTO 用户 DTO
     * @return User 实体
     */
    public static User toUser (UserDTO userDTO) {
        Gender gender = null;
        if (userDTO.getGender() != null && !userDTO.getGender().trim().isEmpty()) {
            String genderStr = userDTO.getGender().trim();

            // 通过中文值匹配
            for (Gender g : Gender.values()) {
                if (g.getValue().equals(genderStr)) {
                    gender = g;
                    break;
                }
            }
        }

        return User.builder()
                .userId(userDTO.getUserId())
                .username(userDTO.getName())
                .gender(gender)
//                .dateOfBirth(userDTO.getDateOfBirth())
//                .phone(userDTO.getPhone())
                .role(userDTO.getRole())
                .avatarUrl(userDTO.getAvatarUrl())
                .hobbies(userDTO.getHobbies())
                .healthCondition(userDTO.getHealthCondition())
                .age(userDTO.getAge())
                .build();
    }

    /**
     * 转换为简化的用户信息（用于登录响应）
     * 
     * @return LoginResponse.UserInfo
     */
    public LoginResponse.UserInfo toUserInfo() {
        return LoginResponse.UserInfo.builder()
                .userId(this.userId)
                .name(this.name)
                .avatarUrl(this.avatarUrl)
                .role(this.role.getValue())
                .build();
    }
}

