package work.foofish.course.exception;

/**
 * 权限不足异常
 * 用于表示用户没有权限访问某个资源或执行某个操作
 */
public class ForbiddenException extends RuntimeException {
    
    public ForbiddenException(String message) {
        super(message);
    }

    public ForbiddenException(String message, Throwable cause) {
        super(message, cause);
    }
}

