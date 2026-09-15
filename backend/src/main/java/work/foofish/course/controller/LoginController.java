package work.foofish.course.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import work.foofish.course.annotation.refreshAuth;
import work.foofish.course.data.dto.AuthRequest;
import work.foofish.course.data.vo.Result;
import work.foofish.course.service.LoginService;

@CrossOrigin
@RestController
@RequestMapping("/api")
public class LoginController {
    private final LoginService loginService;

    public LoginController(LoginService loginService) {
        this.loginService = loginService;
    }

    @PostMapping("/register")
    public ResponseEntity<Result> register(@RequestBody AuthRequest registerReqDTO) {
        return loginService.register(registerReqDTO);
    }

    @PostMapping("/login")
    public ResponseEntity<Result> login(@RequestBody AuthRequest loginReqDTO) {
        return loginService.login(loginReqDTO);
    }

    @refreshAuth
    @PostMapping("/refresh")
    public ResponseEntity<Result> refresh (HttpServletRequest request) {
        return loginService.refresh(request);
    }
}
