package work.foofish.course.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import work.foofish.course.annotation.Auth;
import work.foofish.course.data.dto.CareRecordRequest;
import work.foofish.course.data.enums.Role;
import work.foofish.course.data.vo.Result;
import work.foofish.course.service.CareRecordService;

@CrossOrigin
@RestController
@RequestMapping("/api")
public class CareRecordController {
    private final CareRecordService careRecordService;

    public CareRecordController(CareRecordService careRecordService) { this.careRecordService = careRecordService; }

    @Auth(roles = {Role.ADMIN, Role.CAREGIVER})
    @GetMapping("/care/users")
    public ResponseEntity<Result> listElders() { return careRecordService.listElders(); }

    @Auth
    @GetMapping("/care-records/user/{userId}")
    public ResponseEntity<Result> listByUser(@PathVariable Long userId, HttpServletRequest request) {
        return careRecordService.listByUser(userId,
                Long.parseLong((String) request.getAttribute("userId")),
                (String) request.getAttribute("role"));
    }

    @Auth(roles = {Role.ADMIN, Role.CAREGIVER})
    @PostMapping("/care-records")
    public ResponseEntity<Result> create(@RequestBody CareRecordRequest body, HttpServletRequest request) {
        return careRecordService.create(body, Long.parseLong((String) request.getAttribute("userId")));
    }

    @Auth(roles = {Role.ADMIN, Role.CAREGIVER})
    @DeleteMapping("/care-records/{recordId}")
    public ResponseEntity<Result> delete(@PathVariable Long recordId) {
        return careRecordService.delete(recordId);
    }
}
