package work.foofish.course.service;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import work.foofish.course.data.dto.CourseCreateRequest;
import work.foofish.course.data.dto.CourseUpdateRequest;
import work.foofish.course.data.enums.CourseStatus;
import work.foofish.course.data.po.Course;
import work.foofish.course.data.vo.CourseVO;
import work.foofish.course.data.vo.Result;
import work.foofish.course.mapper.CourseMapper;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CourseService {

    private final CourseMapper courseMapper;

    public CourseService (CourseMapper courseMapper) {
        this.courseMapper = courseMapper;
    }

    public ResponseEntity<Result> listCourses (String category, String keyword, Integer page, Integer pageSize) {
        int pageNo = (page == null || page < 1) ? 1 : page;
        int size = (pageSize == null || pageSize < 1) ? 10 : Math.min(pageSize, 100);
        long offset = (long) (pageNo - 1) * size;

        String categoryFilter = StringUtils.hasText(category) ? category.trim() : null;
        String keywordFilter = StringUtils.hasText(keyword) ? keyword.trim() : null;

        List<Course> courses = courseMapper.searchCourses(categoryFilter, keywordFilter, offset, size);
        long total = courseMapper.countCourses(categoryFilter, keywordFilter);

        List<CourseVO> list = courses.stream()
                .map(CourseVO::fromEntity)
                .toList();

        Map<String, Object> data = new HashMap<>();
        data.put("list", list);
        data.put("total", total);

        return Result.success(data, "获取课程列表成功");
    }

    public ResponseEntity<Result> getCourseDetail (Long courseId) {
        Course course = courseMapper.getCourseWithEnrollment(courseId);
        if (course == null || Boolean.TRUE.equals(course.getIsDeleted())) {
            return Result.error(404, "课程不存在");
        }

        return Result.success(CourseVO.fromEntity(course), "获取课程详情成功");
    }

    public ResponseEntity<Result> createCourse (CourseCreateRequest request) {
        // 手动校验必传字段：title, capacity, class_time, location
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            return Result.error(400, "课程名称不能为空");
        }
        if (request.getCapacity() == null) {
            return Result.error(400, "招生人数不能为空");
        }
        if (request.getCapacity() <= 0) {
            return Result.error(400, "招生人数必须大于0");
        }
        if (request.getClassTime() == null || request.getClassTime().trim().isEmpty()) {
            return Result.error(400, "上课时间不能为空");
        }
        if (request.getLocation() == null || request.getLocation().trim().isEmpty()) {
            return Result.error(400, "上课地点不能为空");
        }

        // 校验状态
        CourseStatus status = parseStatusOrDefault(request.getStatus(), CourseStatus.NOT_STARTED);
        if (status == null) {
            return Result.error(400, "课程状态不合法");
        }

        // 校验日期（如果提供了的话）
        ResponseEntity<Result> validationError = validateDates(request.getStartDate(), request.getEndDate());
        if (validationError != null) {
            return validationError;
        }

        // 处理必传字段
        String title = request.getTitle().trim();
        String classTime = request.getClassTime().trim();
        String location = request.getLocation().trim();

        // 处理可选字段
        String category = request.getCategory() != null ? request.getCategory().trim() : null;
        String description = request.getDescription() != null ? request.getDescription().trim() : null;

        Course course = Course.builder()
                .title(title)
                .category(category)
                .description(description)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .classTime(classTime)
                .location(location)
                .capacity(request.getCapacity())
                .status(status)
                .imageUrl(request.getImageUrl())
                .contactPhone(request.getContactPhone())
                .isDeleted(false)
                .build();

        courseMapper.insert(course);

        Map<String, Object> data = Map.of("course_id", course.getCourseId());
        return Result.success(data, "课程创建成功");
    }

    public ResponseEntity<Result> updateCourse (Long courseId, CourseUpdateRequest request) {
        Course existing = courseMapper.selectById(courseId);
        if (existing == null || Boolean.TRUE.equals(existing.getIsDeleted())) {
            return Result.error(404, "课程不存在");
        }

        if (request.getStatus() != null) {
            CourseStatus status = parseStatusOrDefault(request.getStatus(), null);
            if (status == null) {
                return Result.error(400, "课程状态不合法");
            }
            existing.setStatus(status);
        }

        if (StringUtils.hasText(request.getTitle())) {
            existing.setTitle(request.getTitle().trim());
        }
        if (StringUtils.hasText(request.getCategory())) {
            existing.setCategory(request.getCategory().trim());
        }
        if (request.getDescription() != null) {
            existing.setDescription(request.getDescription());
        }
        if (request.getStartDate() != null) {
            existing.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            existing.setEndDate(request.getEndDate());
        }
        if (StringUtils.hasText(request.getClassTime())) {
            existing.setClassTime(request.getClassTime().trim());
        }
        if (StringUtils.hasText(request.getLocation())) {
            existing.setLocation(request.getLocation().trim());
        }
        if (request.getCapacity() != null) {
            if (request.getCapacity() <= 0) {
                return Result.error(400, "招生人数必须大于0");
            }
            existing.setCapacity(request.getCapacity());
        }
        if (request.getImageUrl() != null) {
            existing.setImageUrl(request.getImageUrl());
        }
        if (request.getContactPhone() != null) {
            existing.setContactPhone(request.getContactPhone());
        }

        ResponseEntity<Result> validationError = validateDates(
                existing.getStartDate(),
                existing.getEndDate()
        );
        if (validationError != null) {
            return validationError;
        }

        int rows = courseMapper.updateById(existing);
        if (rows != 1) {
            return Result.error(500, "修改课程失败");
        }

        return Result.success(null, "修改成功");
    }

    public ResponseEntity<Result> deleteCourse (Long courseId) {
        Course existing = courseMapper.selectById(courseId);
        if (existing == null || Boolean.TRUE.equals(existing.getIsDeleted())) {
            return Result.error(404, "课程不存在");
        }

        existing.setIsDeleted(true);
        int rows = courseMapper.updateById(existing);
        if (rows != 1) {
            return Result.error(500, "删除课程失败");
        }

        return Result.success(null, "删除成功");
    }

    private CourseStatus parseStatusOrDefault (Integer statusValue, CourseStatus defaultStatus) {
        if (statusValue == null) {
            return defaultStatus;
        }
        for (CourseStatus status : CourseStatus.values()) {
            if (status.getValue() == statusValue) {
                return status;
            }
        }
        return null;
    }

    private ResponseEntity<Result> validateDates (LocalDate startDate, LocalDate endDate) {
        // start_date 现在是可选的，只有当两个日期都存在时才校验大小关系
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            return Result.error(400, "结课日期不能早于开课日期");
        }
        return null;
    }
}
