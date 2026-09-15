package work.foofish.course.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import work.foofish.course.data.po.FileUpload;

/**
 * 文件上传 Mapper 接口
 * 继承 MyBatis-Plus BaseMapper，提供基础 CRUD 操作
 */
@Mapper
public interface FileUploadMapper extends BaseMapper<FileUpload> {
    // MyBatis-Plus 已提供基础 CRUD 方法
    // 如需自定义查询，可在此添加
}

