package work.foofish.course.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import work.foofish.course.data.po.Activity;
import work.foofish.course.data.vo.ActivityVO;

import java.util.List;

@Mapper
public interface ActivityMapper extends BaseMapper<Activity> {
    @Select("""
            SELECT a.activity_id, a.title, a.summary, a.activity_date, a.location,
                   a.contact_phone, a.publisher_id, u.username AS publisher_name
            FROM activities a
            JOIN users u ON u.user_id = a.publisher_id
            WHERE a.is_published = TRUE AND a.activity_date >= NOW()
            ORDER BY a.activity_date ASC
            LIMIT #{limit}
            """)
    List<ActivityVO> listUpcoming(@Param("limit") int limit);
}
