package work.foofish.course.service;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import work.foofish.course.data.dto.ChangePasswordRequest;
import work.foofish.course.data.dto.UserDTO;
import work.foofish.course.data.dto.RoleUpdateRequest;
import work.foofish.course.data.enums.Role;
import work.foofish.course.data.po.User;
import work.foofish.course.data.vo.Result;
import work.foofish.course.exception.ForbiddenException;
import work.foofish.course.mapper.UserMapper;
import work.foofish.course.utils.BcryptUtil;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserService {
    private final UserMapper userMapper;

    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    /**
     * 获取用户信息
     * 权限控制：普通用户只能查看自己的信息，管理员可以查看所有用户信息
     *
     * @param userId 要查询的用户ID
     * @param currentUserId 当前登录用户ID
     * @param currentUserRole 当前登录用户角色
     * @return 用户信息
     */
    public ResponseEntity<Result> getUserInfo(String userId, String currentUserId, String currentUserRole) {
        // 权限验证：普通用户只能查看自己的信息
        if (!Role.ADMIN.getValue().equals(currentUserRole) && !userId.equals(currentUserId)) {
            throw new ForbiddenException("无权访问其他用户信息");
        }

        UserDTO userDTO = UserDTO.fromUser(userMapper.getUserByUserId(userId));
        if (userDTO == null) {
            return Result.error(404, "用户不存在");
        }
        return Result.success(userDTO, "获取用户信息成功");
    }

    /**
     * 更新用户信息（部分更新）
     * 权限控制：普通用户只能修改自己的信息，管理员可以修改所有用户信息
     * 只更新请求中包含的非 null 字段，其他字段保持不变
     *
     * @param userId 要修改的用户ID
     * @param currentUserId 当前登录用户ID
     * @param currentUserRole 当前登录用户角色
     * @param userDTO 更新的用户信息（只包含需要更新的字段）
     * @return 更新结果
     */
    public ResponseEntity<Result> updateUserInfo(String userId, String currentUserId, String currentUserRole, UserDTO userDTO) {
        // 权限验证：普通用户只能修改自己的信息
        if (!Role.ADMIN.getValue().equals(currentUserRole) && !userId.equals(currentUserId)) {
            throw new ForbiddenException("无权修改其他用户信息");
        }

        // 验证用户是否存在
        UserDTO existingUser = UserDTO.fromUser(userMapper.getUserByUserId(userId));
        if (existingUser == null) {
            return Result.error(404, "用户不存在");
        }

        // 设置 userId 以确保更新正确的用户
        userDTO.setUserId(Long.parseLong(userId));

        // 使用部分更新方法，只更新非 null 字段
        int result = userMapper.updateUserSelective(UserDTO.toUser(userDTO));
        if (result != 1) {
            return Result.error(500, "更新用户信息失败");
        }
        return Result.success(null, "更新用户信息成功");
    }

    /**
     * 修改用户密码
     * 权限控制：普通用户只能修改自己的密码，管理员可以修改所有用户密码
     *
     * @param userId          要修改密码的用户ID
     * @param currentUserId   当前登录用户ID
     * @param currentUserRole 当前登录用户角色
     * @param request         修改密码请求（包含旧密码和新密码）
     * @return 修改结果
     */
    public ResponseEntity<Result> changePassword (String userId, String currentUserId, String currentUserRole, ChangePasswordRequest request) {
        // 权限验证：普通用户只能修改自己的密码
        if (!Role.ADMIN.getValue().equals(currentUserRole) && !userId.equals(currentUserId)) {
            throw new ForbiddenException("无权修改其他用户密码");
        }

        // 验证请求参数
        if (request.getOldPassword() == null || request.getOldPassword().trim().isEmpty()) {
            return Result.error(400, "旧密码不能为空");
        }
        if (request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
            return Result.error(400, "新密码不能为空");
        }

        // 查询用户
        User user = userMapper.getUserByUserId(userId);
        if (user == null) {
            return Result.error(404, "用户不存在");
        }

        // 验证旧密码
        if (!BcryptUtil.verifyPasswd(request.getOldPassword(), user.getPasswordHash())) {
            return Result.error(401, "旧密码错误");
        }

        // 加密新密码并更新
        String newPasswordHash = BcryptUtil.encrypt(request.getNewPassword());
        int result = userMapper.updatePassword(user.getUserId(), newPasswordHash);
        if (result != 1) {
            return Result.error(500, "修改密码失败");
        }

        return Result.success(null, "修改密码成功");
    }

    /**
     * 管理员获取用户列表
     */
    public ResponseEntity<Result> listUsers (String keyword, Integer page, Integer pageSize) {
        int pageNo = (page == null || page < 1) ? 1 : page;
        int size = (pageSize == null || pageSize < 1) ? 10 : Math.min(pageSize, 100);
        long offset = (long) (pageNo - 1) * size;

        String filter = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        List<User> users = userMapper.listUsers(filter, offset, size);
        List<UserDTO> list = users.stream()
                .map(UserDTO::fromUser)
                .toList();
        long total = userMapper.countUsers(filter);

        Map<String, Object> data = new HashMap<>();
        data.put("list", list);
        data.put("total", total);

        return Result.success(data, "获取用户列表成功");
    }

    /**
     * 管理员逻辑删除用户
     */
    public ResponseEntity<Result> deleteUser (Long userId) {
        User user = userMapper.getUserByUserId(String.valueOf(userId));
        if (user == null || Boolean.TRUE.equals(user.getIsDeleted())) {
            return Result.error(404, "用户不存在");
        }
        int rows = userMapper.softDeleteUser(userId);
        if (rows != 1) {
            return Result.error(500, "删除用户失败");
        }
        return Result.success(null, "删除成功");
    }

    public ResponseEntity<Result> updateUserRole (Long userId, RoleUpdateRequest request) {
        if (request == null || request.getRole() == null) {
            return Result.error(400, "用户角色不能为空");
        }
        User user = userMapper.getUserByUserId(String.valueOf(userId));
        if (user == null || Boolean.TRUE.equals(user.getIsDeleted())) {
            return Result.error(404, "用户不存在");
        }
        if (user.getRole() == Role.ADMIN && request.getRole() != Role.ADMIN) {
            return Result.error(400, "管理员角色不可在此降级");
        }
        int rows = userMapper.updateRole(userId, request.getRole());
        return rows == 1
                ? Result.success(null, "用户角色更新成功")
                : Result.error(500, "用户角色更新失败");
    }
}
