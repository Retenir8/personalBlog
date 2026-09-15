package work.foofish.course.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import work.foofish.course.annotation.Auth;
import work.foofish.course.data.dto.FileUploadResponse;
import work.foofish.course.data.vo.Result;
import work.foofish.course.service.FileStorageService;

/**
 * 文件上传控制器
 * 提供文件上传接口
 */
@CrossOrigin
@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    private final FileStorageService fileStorageService;

    public FileUploadController (FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    /**
     * 图片上传接口
     * POST /api/upload/image
     * <p>
     * 请求方式：multipart/form-data
     * 字段名：file
     * <p>
     * 返回示例：
     * {
     * "code": 200,
     * "message": "上传成功",
     * "data": { "image_url": "/uploads/2024/10/24/xxx.jpg" }
     * }
     *
     * @param file    上传的文件
     * @param request HTTP 请求（用于获取用户信息）
     * @return 文件上传响应
     */
    @Auth
    @PostMapping("/image")
    public ResponseEntity<Result> uploadImage (
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "fileType", required = false, defaultValue = "other") String fileType,
            HttpServletRequest request
    ) {
        // 从请求中获取当前用户ID（由 @Auth 注解注入）
        String userIdStr = (String) request.getAttribute("userId");
        Long uploaderId = userIdStr != null ? Long.parseLong(userIdStr) : null;

        // 调用服务层上传文件
        FileUploadResponse response = fileStorageService.uploadImage(file, uploaderId, fileType);

        // 返回成功响应
        return Result.success(response, "上传成功");
    }

    /**
     * 删除文件接口（逻辑删除）
     * DELETE /api/upload/{fileId}
     *
     * @param fileId  文件ID
     * @param request HTTP 请求
     * @return 删除结果
     */
    @Auth
    @DeleteMapping("/{fileId}")
    public ResponseEntity<Result> deleteFile (
            @PathVariable Long fileId,
            HttpServletRequest request
    ) {
        fileStorageService.deleteFile(fileId);
        return Result.success(null, "删除成功");
    }
}

