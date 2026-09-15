package work.foofish.course.data.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * 文件上传记录实体类
 * 对应数据库 file_uploads 表
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@TableName("file_uploads")
public class FileUpload {

    /**
     * 文件唯一ID
     */
    @TableId(value = "file_id", type = IdType.AUTO)
    private Long fileId;

    /**
     * 原始文件名（用户上传时的文件名）
     */
    private String originalFilename;

    /**
     * 存储文件名（系统生成的唯一文件名）
     */
    private String storedFilename;

    /**
     * 文件完整路径（相对路径）
     */
    private String filePath;

    /**
     * 文件大小（字节）
     */
    private Long fileSize;

    /**
     * 文件 MIME 类型
     */
    private String contentType;

    /**
     * 上传时间
     */
    private OffsetDateTime uploadTime;

    /**
     * 上传者用户ID
     */
    private Long uploaderId;

    /**
     * 文件类型标识（avatar/course_image/other）
     */
    private String fileType;

    /**
     * 逻辑删除标记（0=正常，1=已删除）
     */
    private Integer isDeleted;

    /**
     * 创建时间
     */
    private OffsetDateTime createTime;

    /**
     * 最后更新时间
     */
    private OffsetDateTime updateTime;
}

