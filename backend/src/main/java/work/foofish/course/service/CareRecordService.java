package work.foofish.course.service;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import work.foofish.course.data.dto.CareRecordRequest;
import work.foofish.course.data.dto.UserDTO;
import work.foofish.course.data.enums.Role;
import work.foofish.course.data.po.CareRecord;
import work.foofish.course.data.po.User;
import work.foofish.course.data.vo.Result;
import work.foofish.course.exception.ForbiddenException;
import work.foofish.course.mapper.CareRecordMapper;
import work.foofish.course.mapper.UserMapper;

import java.time.OffsetDateTime;

@Service
public class CareRecordService {
    private final CareRecordMapper careRecordMapper;
    private final UserMapper userMapper;

    public CareRecordService(CareRecordMapper careRecordMapper, UserMapper userMapper) {
        this.careRecordMapper = careRecordMapper;
        this.userMapper = userMapper;
    }

    public ResponseEntity<Result> listElders() {
        return Result.success(userMapper.listElderUsers().stream().map(UserDTO::fromUser).toList(), "获取长者列表成功");
    }

    public ResponseEntity<Result> listByUser(Long targetUserId, Long currentUserId, String role) {
        boolean staff = Role.ADMIN.getValue().equals(role) || Role.CAREGIVER.getValue().equals(role);
        if (!staff && !targetUserId.equals(currentUserId)) {
            throw new ForbiddenException("无权查看其他用户的健康记录");
        }
        return Result.success(careRecordMapper.listByUser(targetUserId), "获取健康记录成功");
    }

    public ResponseEntity<Result> create(CareRecordRequest request, Long recorderId) {
        if (request == null || request.getUserId() == null) {
            return Result.error(400, "请选择长者");
        }
        User elder = userMapper.selectById(request.getUserId());
        if (elder == null || elder.getRole() != Role.USER || Boolean.TRUE.equals(elder.getIsDeleted())) {
            return Result.error(400, "所选长者不存在");
        }
        if (!StringUtils.hasText(request.getPhysicalStatus()) || !StringUtils.hasText(request.getMentalStatus())) {
            return Result.error(400, "身心状态不能为空");
        }
        CareRecord record = CareRecord.builder()
                .userId(request.getUserId())
                .recorderId(recorderId)
                .physicalStatus(request.getPhysicalStatus().trim())
                .mentalStatus(request.getMentalStatus().trim())
                .checkDetails(request.getCheckDetails())
                .checkedAt(request.getCheckedAt() == null ? OffsetDateTime.now() : request.getCheckedAt())
                .advice(request.getAdvice())
                .build();
        careRecordMapper.insert(record);
        return Result.success(java.util.Map.of("recordId", record.getRecordId()), "健康记录添加成功");
    }

    public ResponseEntity<Result> delete(Long recordId) {
        CareRecord record = careRecordMapper.selectById(recordId);
        if (record == null) {
            return Result.error(404, "健康记录不存在");
        }
        return careRecordMapper.deleteById(recordId) == 1
                ? Result.success(null, "健康记录已删除")
                : Result.error(500, "删除健康记录失败");
    }
}
