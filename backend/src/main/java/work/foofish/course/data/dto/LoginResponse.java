package work.foofish.course.data.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 登录响应 DTO
 * 用于登录接口返回，包含 token 和用户详细信息
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    /**
     * 访问令牌（短期有效）
     */
    private String accessToken;

    /**
     * 刷新令牌（长期有效）
     */
    private String refreshToken;

    /**
     * 用户基本信息（登录时返回）
     */
    private UserInfo user;

    /**
     * 用户信息内部类
     * 只包含登录后需要返回的基本信息
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserInfo {
        private Long userId;
        private String name;
        private String avatarUrl;
        private String role;
    }
}


