import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Role } from "src/enums/role.enum";

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        return user  && user.role.includes(Role.ADMIN);
    }
}