package work.foofish.course.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import work.foofish.course.config.R2StorageConfig;
import work.foofish.course.data.dto.FileUploadResponse;
import work.foofish.course.data.po.FileUpload;
import work.foofish.course.exception.CustomException;
import work.foofish.course.mapper.FileUploadMapper;

import java.io.IOException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * 文件存储服务
 * 负责文件上传到 Cloudflare R2 和数据库记录管理
 */
@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    // 允许的图片 MIME 类型
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
    );

    // 允许的文件扩展名
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "jpg", "jpeg", "png", "gif", "webp"
    );

    // 最大文件大小：5MB
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private final S3Client s3Client;
    private final R2StorageConfig.R2Properties r2Properties;
    private final FileUploadMapper fileUploadMapper;

    public FileStorageService (
            S3Client s3Client,
            R2StorageConfig.R2Properties r2Properties,
            FileUploadMapper fileUploadMapper
    ) {
        this.s3Client = s3Client;
        this.r2Properties = r2Properties;
        this.fileUploadMapper = fileUploadMapper;
    }

    /**
     * 上传图片文件
     *
     * @param file       上传的文件
     * @param uploaderId 上传者用户ID（可选）
     * @param fileType   文件类型标识（avatar/course_image/other）
     * @return 文件上传响应
     */
    public FileUploadResponse uploadImage (MultipartFile file, Long uploaderId, String fileType) {
        // 1. 验证文件
        validateFile(file);

        // 2. 生成文件存储路径和名称
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String storedFilename = generateUniqueFilename(extension);
        String filePath = generateFilePath(storedFilename);

        try {
            // 3. 上传到 R2
            uploadToR2(file, filePath);

            // 4. 保存文件记录到数据库
            FileUpload fileUpload = FileUpload.builder()
                    .originalFilename(originalFilename)
                    .storedFilename(storedFilename)
                    .filePath(filePath)
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .uploadTime(OffsetDateTime.now())
                    .uploaderId(uploaderId)
                    .fileType(fileType != null ? fileType : "other")
                    .isDeleted(0)
                    .createTime(OffsetDateTime.now())
                    .updateTime(OffsetDateTime.now())
                    .build();

            fileUploadMapper.insert(fileUpload);

            log.info("文件上传成功: {} -> {}", originalFilename, filePath);

            // 5. 返回响应
            return FileUploadResponse.builder()
                    .imageUrl(filePath)
//                    .fileId(fileUpload.getFileId())
                    .build();

        } catch (S3Exception e) {
            log.error("R2 上传失败: {}", e.getMessage(), e);
            throw new CustomException("文件上传到云存储失败: " + e.awsErrorDetails().errorMessage());
        } catch (IOException e) {
            log.error("文件读取失败: {}", e.getMessage(), e);
            throw new CustomException("文件读取失败");
        } catch (Exception e) {
            log.error("文件上传异常: {}", e.getMessage(), e);
            throw new CustomException("文件上传失败: " + e.getMessage());
        }
    }

    /**
     * 验证文件
     */
    private void validateFile (MultipartFile file) {
        // 检查文件是否为空
        if (file == null || file.isEmpty()) {
            throw new CustomException("文件不能为空");
        }

        // 检查文件大小
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new CustomException("文件大小不能超过 5MB");
        }

        // 检查文件类型
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new CustomException("不支持的文件类型，仅支持: JPG, PNG, GIF, WEBP");
        }

        // 检查文件扩展名
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new CustomException("文件名不能为空");
        }

        String extension = getFileExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new CustomException("不支持的文件扩展名，仅支持: jpg, jpeg, png, gif, webp");
        }
    }

    /**
     * 获取文件扩展名
     */
    private String getFileExtension (String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    /**
     * 生成唯一文件名（UUID + 扩展名）
     */
    private String generateUniqueFilename (String extension) {
        return UUID.randomUUID().toString() + "." + extension;
    }

    /**
     * 生成文件存储路径（按日期组织：/uploads/YYYY/MM/DD/filename）
     */
    private String generateFilePath (String filename) {
        LocalDate now = LocalDate.now();
        return String.format("/uploads/%d/%02d/%02d/%s",
                now.getYear(),
                now.getMonthValue(),
                now.getDayOfMonth(),
                filename
        );
    }

    /**
     * 上传文件到 R2
     */
    private void uploadToR2 (MultipartFile file, String filePath) throws IOException {
        // 移除开头的斜杠（S3 key 不应以斜杠开头）
        String s3Key = filePath.startsWith("/") ? filePath.substring(1) : filePath;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(r2Properties.getBucketName())
                .key(s3Key)
                .contentType(file.getContentType())
                .contentLength(file.getSize())
                .build();

        s3Client.putObject(
                putObjectRequest,
                RequestBody.fromInputStream(file.getInputStream(), file.getSize())
        );
    }

    /**
     * 删除文件（逻辑删除）
     *
     * @param fileId 文件ID
     */
    public void deleteFile (Long fileId) {
        FileUpload fileUpload = fileUploadMapper.selectById(fileId);
        if (fileUpload == null) {
            throw new CustomException("文件不存在");
        }

        fileUpload.setIsDeleted(1);
        fileUpload.setUpdateTime(OffsetDateTime.now());
        fileUploadMapper.updateById(fileUpload);

        log.info("文件已标记为删除: {}", fileUpload.getFilePath());
    }
}

