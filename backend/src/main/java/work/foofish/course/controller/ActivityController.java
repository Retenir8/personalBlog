package work.foofish.course.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import work.foofish.course.annotation.Auth;
import work.foofish.course.data.dto.ActivityRequest;
import work.foofish.course.data.enums.Role;
import work.foofish.course.data.vo.Result;
import work.foofish.course.service.ActivityService;

@CrossOrigin
@RestController
@RequestMapping("/api/activities")
public class ActivityController {
    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) { this.activityService = activityService; }

    @GetMapping
    public ResponseEntity<Result> list(@RequestParam(required = false) Integer limit) {
        return activityService.listUpcoming(limit);
    }

    @Auth(roles = {Role.ADMIN, Role.CAREGIVER})
    @PostMapping
    public ResponseEntity<Result> create(@RequestBody ActivityRequest request, HttpServletRequest httpRequest) {
        return activityService.create(request, Long.parseLong((String) httpRequest.getAttribute("userId")));
    }

    @Auth(roles = {Role.ADMIN, Role.CAREGIVER})
    @DeleteMapping("/{activityId}")
    public ResponseEntity<Result> delete(@PathVariable Long activityId) {
        return activityService.delete(activityId);
    }
}
