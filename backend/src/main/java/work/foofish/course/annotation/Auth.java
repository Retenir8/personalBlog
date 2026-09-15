package work.foofish.course.annotation;

import work.foofish.course.data.enums.Role;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 自定义注解，用于标记需要 Token 校验和权限控制的方法
 *
 * 使用示例：
 * - @Auth - 只需要登录，不限制角色
 * - @Auth(role = Role.ADMIN) - 需要管理员权限
 * - @Auth(role = Role.USER) - 需要普通用户权限（默认）
 */
@Target(ElementType.METHOD) // 作用于方法
@Retention(RetentionPolicy.RUNTIME) // 运行时有效
public @interface Auth {
    /**
     * 需要的角色权限
     * 默认为 USER，表示普通用户和管理员都可以访问
     * 设置为 ADMIN 时，只有管理员可以访问
     */
    Role role() default Role.USER;

    /** 允许访问的角色。非空时优先于 role。 */
    Role[] roles() default {};
}
