package work.foofish.course.data.dto;

import lombok.Data;
import work.foofish.course.data.enums.Role;

@Data
public class RoleUpdateRequest {
    private Role role;
}
