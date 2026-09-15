package work.foofish.course.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import work.foofish.course.annotation.Auth;
import work.foofish.course.data.enums.Role;
import work.foofish.course.data.dto.RoleUpdateRequest;
import work.foofish.course.data.vo.Result;
import work.foofish.course.service.UserService;

@CrossOrigin
@RestController
@RequestMapping("/api/admin")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController (UserService userService) {
        this.userService = userService;
    }

    @Auth(role = Role.ADMIN)
    @GetMapping("/users")
    public ResponseEntity<Result> listUsers (@RequestParam(required = false) String keyword,
                                             @RequestParam(required = false) Integer page,
                                             @RequestParam(required = false, name = "pageSize") Integer pageSize,
                                             @RequestParam(required = false, name = "page_size") Integer pageSizeSnake) {
        Integer size = pageSize != null ? pageSize : pageSizeSnake;
        return userService.listUsers(keyword, page, size);
    }

    @Auth(role = Role.ADMIN)
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Result> deleteUser (@PathVariable Long userId) {
        return userService.deleteUser(userId);
    }

    @Auth(role = Role.ADMIN)
    @PutMapping("/user/{userId}/role")
    public ResponseEntity<Result> updateUserRole (@PathVariable Long userId,
                                                  @RequestBody RoleUpdateRequest request) {
        return userService.updateUserRole(userId, request);
    }
}
