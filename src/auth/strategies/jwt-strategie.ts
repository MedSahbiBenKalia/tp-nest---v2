import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { config } from "dotenv";
import { Strategy } from "passport-jwt";
import { UserService } from "../../user/user.service";
import { ExtractJwt } from "passport-jwt";

import { JwtPayloadInterface } from "../interfaces/payload.interface";

import * as env from 'dotenv';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly userService: UserService,
                private readonly configService: ConfigService
    ) 
        {
        super( 
            {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get("JWT_SECRET") ?? '',
            }
        );
        }
    async validate(payload: JwtPayloadInterface): Promise<any> {
        console.log(payload);
        
        const user = await this.userService.findOne(payload.id);
        if (!user) {
            throw new UnauthorizedException("User not found after JWT validation");
        }
        const { password, salt, ...result } = user; // remove password and salt from the user object
        return result;
    }
    
}
