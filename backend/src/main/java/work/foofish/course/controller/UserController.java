package work.foofish.course.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import work.foofish.course.annotation.Auth;
import work.foofish.course.data.dto.ChangePasswordRequest;
import work.foofish.course.data.dto.UserDTO;
import work.foofish.course.data.vo.Result;
import work.foofish.course.service.UserService;

@CrossOrigin
@RestController
@RequestMapping("/api/user")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * 获取用户信息
     * 普通用户只能查看自己的信息，管理员可以查看所有用户信息
     */
    @Auth
    @GetMapping("/{userId}")
    public ResponseEntity<Result> getUserInfo(
            @PathVariable String userId,
            HttpServletRequest request
    ) {
        String currentUserId = (String) request.getAttribute("userId");
        String currentUserRole = (String) request.getAttribute("role");
        return userService.getUserInfo(userId, currentUserId, currentUserRole);
    }

    /**
     * 更新用户信息
     * 普通用户只能修改自己的信息，管理员可以修改所有用户信息
     */
    @Auth
    @PutMapping("/{userId}")
    public ResponseEntity<Result> updateUserInfo(
            @PathVariable String userId,
            @RequestBody UserDTO userDTO,
            HttpServletRequest request
    ) {
        String currentUserId = (String) request.getAttribute("userId");
        String currentUserRole = (String) request.getAttribute("role");
        return userService.updateUserInfo(userId, currentUserId, currentUserRole, userDTO);
    }

    /**
     * 修改用户密码
     * 普通用户只能修改自己的密码，管理员可以修改所有用户密码
     */
    @Auth
    @PutMapping("/{userId}/password")
    public ResponseEntity<Result> changePassword (
            @PathVariable String userId,
            @RequestBody ChangePasswordRequest request,
            HttpServletRequest httpRequest
    ) {
        String currentUserId = (String) httpRequest.getAttribute("userId");
        String currentUserRole = (String) httpRequest.getAttribute("role");
        return userService.changePassword(userId, currentUserId, currentUserRole, request);
    }
}
