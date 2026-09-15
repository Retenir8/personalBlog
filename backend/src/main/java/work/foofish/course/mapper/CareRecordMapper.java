package work.foofish.course.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import work.foofish.course.data.po.CareRecord;
import work.foofish.course.data.vo.CareRecordVO;

import java.util.List;

@Mapper
public interface CareRecordMapper extends BaseMapper<CareRecord> {
    @Select("""
            SELECT r.record_id, r.user_id, elder.username AS elder_name,
                   r.recorder_id, recorder.username AS recorder_name,
                   r.physical_status, r.mental_status, r.check_details,
                   r.checked_at, r.advice, r.created_at
            FROM care_records r
            JOIN users elder ON elder.user_id = r.user_id
            JOIN users recorder ON recorder.user_id = r.recorder_id
            WHERE r.user_id = #{userId}
            ORDER BY r.checked_at DESC, r.record_id DESC
            """)
    List<CareRecordVO> listByUser(@Param("userId") Long userId);
}
