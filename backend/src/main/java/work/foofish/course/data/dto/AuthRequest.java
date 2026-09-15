package work.foofish.course.data.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String username;
    private String password;
}
