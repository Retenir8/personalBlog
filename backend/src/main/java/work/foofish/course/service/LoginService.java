package work.foofish.course.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import work.foofish.course.data.dto.AuthRequest;
import work.foofish.course.data.dto.LoginResponse;
import work.foofish.course.data.dto.RegisterResponse;
import work.foofish.course.data.enums.Role;
import work.foofish.course.data.enums.Status;
import work.foofish.course.data.po.User;
import work.foofish.course.data.vo.Result;
import work.foofish.course.mapper.UserMapper;
import work.foofish.course.utils.BcryptUtil;
import work.foofish.course.utils.JWTUtil;
import work.foofish.course.utils.TokenUtil;

import java.util.Map;

@Service
public class LoginService {
    private final UserMapper userMapper;
    private final JWTUtil jwtUtil;

    public LoginService(UserMapper userMapper, JWTUtil jwtUtil) {
        this.userMapper = userMapper;
        this.jwtUtil = jwtUtil;
    }

    /**
     * 构建登录响应对象
     * 包含 token、refreshToken 和用户详细信息
     *
     * @param user 用户实体
     * @return LoginResponse
     */
    private LoginResponse buildLoginResponse(User user) {
        String userId = String.valueOf(user.getUserId());
        String role = user.getRole().getValue();
        String token = jwtUtil.getToken(userId, role);
        String refreshToken = jwtUtil.getRefreshToken(userId, role);

        // 构建用户信息
        LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.builder()
                .userId(user.getUserId())
                .name(user.getUsername())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().getValue())
                .build();

        // 构建完整的登录响应
        return LoginResponse.builder()
                .accessToken(token)
                .refreshToken(refreshToken)
                .user(userInfo)
                .build();
    }

    /**
     * 构建注册响应对象
     * 只包含 user_id 和 token
     *
     * @param user 用户实体
     * @return RegisterResponse
     */
    private RegisterResponse buildRegisterResponse(User user) {
        String userId = String.valueOf(user.getUserId());
        String role = user.getRole().getValue();
        String token = jwtUtil.getToken(userId, role);
        String refreshToken = jwtUtil.getRefreshToken(userId, role);

        // 构建注册响应
        return RegisterResponse.builder()
                .userId(user.getUserId())
                .accessToken(token)
                .refreshToken(refreshToken)
                .build();
    }

    /**
     * 用户登录
     *
     * @param loginReq 登录请求（包含用户名和密码）
     * @return 包含 token 和用户信息的响应
     */
    public ResponseEntity<Result> login(AuthRequest loginReq) {
        String username = loginReq.getUsername();
        String password = loginReq.getPassword();

        // 查询用户
        User user = userMapper.getUserByUsername(username);
        if (user == null) {
            return Result.error(404, "用户不存在");
        }

        // 验证密码
        if (!BcryptUtil.verifyPasswd(password, user.getPasswordHash())) {
            return Result.error(401, "用户名或密码错误");
        }

        // 返回登录响应（包含用户详细信息）
        return Result.success(buildLoginResponse(user), "登录成功");
    }

    private boolean isExisted(String username) {
        Long userId = userMapper.getUserId(username);
        return userId != null && userId > 0;
    }

    /**
     * 用户注册
     *
     * @param registerReq 注册请求（包含用户名和密码）
     * @return 包含 token 和用户信息的响应
     */
    @Transactional
    public ResponseEntity<Result> register(AuthRequest registerReq) {
        String username = registerReq.getUsername();
        String password = registerReq.getPassword();

        // 检查用户是否已存在
        if (isExisted(username)) {
            return Result.error(409, "用户已存在");
        }

        if (password == null || password.trim().isEmpty()) {
            return Result.error(400, "密码不能为空");
        }

        if (username == null || username.trim().isEmpty()) {
            return Result.error(400, "用户名不能为空");
        }

        // 创建新用户
        User user = User.builder()
                .username(username)
                .passwordHash(BcryptUtil.encrypt(password))
                .role(Role.USER)
                .status(Status.NORMAL)
                .build();
        userMapper.insert(user);

        // 返回注册响应
        return Result.success(buildRegisterResponse(user), "注册成功");
    }

    public ResponseEntity<Result> refresh (HttpServletRequest request) {
        String refreshToken = TokenUtil.extractToken(request);
        String userId = jwtUtil.getUserIdFromRefreshToken(refreshToken);
        String role = jwtUtil.getRoleFromRefreshToken(refreshToken);
        String newToken = jwtUtil.getToken(userId, role);
        String newRefreshToken = jwtUtil.getRefreshToken(userId, role);
        return Result.success(Map.of("accessToken", newToken, "refreshToken", newRefreshToken), "刷新成功");
    }
}
