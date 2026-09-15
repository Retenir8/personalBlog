package work.foofish.course.mapper.provider;

import org.apache.ibatis.jdbc.SQL;
import work.foofish.course.data.po.User;

/**
 * 用户 SQL 提供者
 * 用于生成动态 SQL，实现部分更新功能
 */
public class UserSqlProvider {

    /**
     * 生成部分更新用户信息的 SQL
     * 只更新非 null 的字段
     *
     * @param user 用户对象
     * @return SQL 语句
     */
    public String updateUserSelective(User user) {
        return new SQL() {{
            UPDATE("users");
            
            // 只有当字段不为 null 时才添加到 SET 子句中
            if (user.getUsername() != null) {
                SET("username = #{username}");
            }
            if (user.getGender() != null) {
                SET("gender = #{gender}");
            }
            if (user.getAvatarUrl() != null) {
                SET("avatar_url = #{avatarUrl}");
            }
            if (user.getHobbies() != null) {
                SET("hobbies = #{hobbies}");
            }
            if (user.getHealthCondition() != null) {
                SET("health_condition = #{healthCondition}");
            }
            if (user.getAge() != null) {
                SET("age = #{age}");
            }

            WHERE("user_id = #{userId}");
        }}.toString();
    }
}

