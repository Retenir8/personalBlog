package work.foofish.course.aspect;

import work.foofish.course.annotation.Auth;
import work.foofish.course.data.enums.Role;
import work.foofish.course.data.vo.Result;
import work.foofish.course.exception.ForbiddenException;
import work.foofish.course.utils.JWTUtil;
import work.foofish.course.utils.TokenUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Objects;

@Component
@Aspect
public class AuthAspect {
    @Autowired
    private JWTUtil jwtUtil;

    @Around("@annotation(work.foofish.course.annotation.Auth)") // 拦截带有 @Auth 注解的方法
    public Object verifyToken(ProceedingJoinPoint joinPoint) throws Throwable {
        try {
            // 获取 HTTP 请求中的 Token
            HttpServletRequest request = ((ServletRequestAttributes) Objects.requireNonNull(RequestContextHolder.getRequestAttributes())).getRequest();
            String token = TokenUtil.extractToken(request);

            // 校验 Token 的有效性并提取用户信息
            String userId = jwtUtil.getUserId(token);
            String role = jwtUtil.getRole(token);

            // 将用户信息添加到请求上下文
            request.setAttribute("userId", userId);
            request.setAttribute("role", role);

            // 获取方法上的 @Auth 注解
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            Auth auth = method.getAnnotation(Auth.class);

            // 验证角色权限
            if (auth != null) {
                Role[] allowedRoles = auth.roles();
                if (allowedRoles.length > 0) {
                    boolean allowed = Arrays.stream(allowedRoles)
                            .anyMatch(item -> item.getValue().equals(role));
                    if (!allowed) {
                        throw new ForbiddenException("当前角色无权执行此操作");
                    }
                } else if (auth.role() == Role.ADMIN && !Role.ADMIN.getValue().equals(role)) {
                    throw new ForbiddenException("需要管理员权限");
                }
            }
        } catch (ForbiddenException e) {
            // 权限不足异常直接抛出，由全局异常处理器处理
            throw e;
        } catch (Exception e) {
            return Result.error(401, e.getMessage());
        }

        // 继续执行目标方法
        return joinPoint.proceed();
    }
}
