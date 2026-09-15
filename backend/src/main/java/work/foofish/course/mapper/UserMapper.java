package work.foofish.course.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.*;
import work.foofish.course.data.enums.Role;
import work.foofish.course.data.po.User;
import work.foofish.course.mapper.provider.UserSqlProvider;

/**
 * 用户数据访问层
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {

    /**
     * 根据用户ID查询用户
     */
    @Select("SELECT * FROM users WHERE user_id = #{id}")
    User getUserByUserId(String id);

    /**
     * 根据用户名查询用户
     */
    @Select("SELECT * FROM users WHERE username = #{username}")
    User getUserByUsername(String username);

    /**
     * 根据用户名查询用户ID
     */
    @Select("SELECT user_id FROM users WHERE username = #{username}")
    Long getUserId(String username);

    /**
     * 部分更新用户信息（只更新非 null 字段）
     */
    @UpdateProvider(type = UserSqlProvider.class, method = "updateUserSelective")
    int updateUserSelective(User user);

    /**
     * 更新用户密码
     */
    @Update("UPDATE users SET password_hash = #{passwordHash}, updated_at = NOW() WHERE user_id = #{userId}")
    int updatePassword (Long userId, String passwordHash);

    /**
     * 分页查询用户列表（管理员）
     */
    @Select("""
            SELECT *
            FROM users
            WHERE is_deleted = FALSE
              AND (
                CAST(#{keyword,jdbcType=VARCHAR} AS TEXT) IS NULL
                OR username ILIKE '%' || #{keyword,jdbcType=VARCHAR} || '%'
                OR phone ILIKE '%' || #{keyword,jdbcType=VARCHAR} || '%'
              )
            ORDER BY created_at DESC
            LIMIT #{limit}
            OFFSET #{offset}
            """)
    java.util.List<User> listUsers (@Param("keyword") String keyword,
                                    @Param("offset") long offset,
                                    @Param("limit") long limit);

    /**
     * 统计用户数量（管理员）
     */
    @Select("""
            SELECT COUNT(1)
            FROM users
            WHERE is_deleted = FALSE
              AND (
                CAST(#{keyword,jdbcType=VARCHAR} AS TEXT) IS NULL
                OR username ILIKE '%' || #{keyword,jdbcType=VARCHAR} || '%'
                OR phone ILIKE '%' || #{keyword,jdbcType=VARCHAR} || '%'
              )
            """)
    long countUsers (@Param("keyword") String keyword);

    /**
     * 逻辑删除用户
     */
    @Update("""
            UPDATE users
            SET is_deleted = TRUE,
                updated_at = NOW()
            WHERE user_id = #{userId}
              AND is_deleted = FALSE
            """)
    int softDeleteUser (@Param("userId") Long userId);

    @Update("UPDATE users SET role = #{role}, updated_at = NOW() WHERE user_id = #{userId} AND is_deleted = FALSE")
    int updateRole (@Param("userId") Long userId, @Param("role") Role role);

    @Select("""
            SELECT * FROM users
            WHERE role = 'user' AND is_deleted = FALSE
            ORDER BY username ASC
            """)
    java.util.List<User> listElderUsers();
}
