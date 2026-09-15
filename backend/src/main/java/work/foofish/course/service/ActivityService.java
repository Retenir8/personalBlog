package work.foofish.course.service;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import work.foofish.course.data.dto.ActivityRequest;
import work.foofish.course.data.po.Activity;
import work.foofish.course.data.vo.Result;
import work.foofish.course.mapper.ActivityMapper;

import java.time.OffsetDateTime;
import java.util.Map;

@Service
public class ActivityService {
    private final ActivityMapper activityMapper;

    public ActivityService(ActivityMapper activityMapper) {
        this.activityMapper = activityMapper;
    }

    public ResponseEntity<Result> listUpcoming(Integer limit) {
        int size = limit == null ? 20 : Math.max(1, Math.min(limit, 100));
        return Result.success(activityMapper.listUpcoming(size), "获取近期活动成功");
    }

    public ResponseEntity<Result> create(ActivityRequest request, Long publisherId) {
        if (request == null || !StringUtils.hasText(request.getTitle())) {
            return Result.error(400, "活动标题不能为空");
        }
        if (request.getActivityDate() == null || !request.getActivityDate().isAfter(OffsetDateTime.now())) {
            return Result.error(400, "活动时间必须晚于当前时间");
        }
        if (!StringUtils.hasText(request.getLocation())) {
            return Result.error(400, "活动地点不能为空");
        }
        Activity activity = Activity.builder()
                .title(request.getTitle().trim())
                .summary(request.getSummary())
                .activityDate(request.getActivityDate())
                .location(request.getLocation().trim())
                .contactPhone(request.getContactPhone())
                .publisherId(publisherId)
                .isPublished(true)
                .build();
        activityMapper.insert(activity);
        return Result.success(Map.of("activityId", activity.getActivityId()), "活动发布成功");
    }

    public ResponseEntity<Result> delete(Long activityId) {
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null || !Boolean.TRUE.equals(activity.getIsPublished())) {
            return Result.error(404, "活动不存在");
        }
        activity.setIsPublished(false);
        return activityMapper.updateById(activity) == 1
                ? Result.success(null, "活动已撤下")
                : Result.error(500, "撤下活动失败");
    }
}
