import { ExecutionContext } from "@nestjs/common";
import { Role } from "src/enums/role.enum";

export class AdminGuard {
    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        return user  && user.role.includes(Role.ADMIN);
    }
}