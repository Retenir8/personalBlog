package work.foofish.course.data.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 文件上传响应 DTO
 * 用于文件上传接口返回，符合 API 文档格式
 * <p>
 * API 文档示例：
 * {
 * "code": 200,
 * "message": "上传成功",
 * "data": { "image_url": "/uploads/image_1.jpg" }
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileUploadResponse {

    /**
     * 文件访问路径（相对路径，不包含基础 URL）
     * 例如：/uploads/2024/10/24/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg
     */
    @JsonProperty("image_url")
    private String imageUrl;

    /**
     * 文件ID（可选，用于后续文件管理）
     */
//    @JsonProperty("file_id")
//    private Long fileId;
}

