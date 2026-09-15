package work.foofish.course.aspect;

import work.foofish.course.data.vo.Result;
import work.foofish.course.utils.JWTUtil;
import work.foofish.course.utils.TokenUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Objects;

@Component
@Aspect
public class refreshAuthAspect {
    @Autowired
    private JWTUtil jwtUtil;

    @Around("@annotation(work.foofish.course.annotation.refreshAuth)") // 拦截带有 @refreshAuth 注解的方法
    public Object verifyToken(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = ((ServletRequestAttributes) Objects.requireNonNull(RequestContextHolder.getRequestAttributes())).getRequest();
        String token = TokenUtil.extractToken(request);
        // 校验 Token 的有效性
        try {
            String userId = jwtUtil.getUserIdFromRefreshToken(token);
            request.setAttribute("userId", userId); // 将 userId 添加到请求上下文
        } catch (Exception e) {
            return Result.error(401, String.valueOf(e.getMessage()));
        }

        // 继续执行目标方法
        return joinPoint.proceed();
    }
}
