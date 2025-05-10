import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { JwtPayloadInterface } from '../interfaces/payload.interface';

@Injectable()
export class WsJwtStrategy extends PassportStrategy(Strategy, 'ws-jwt') {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super(
        {
        jwtFromRequest: ExtractJwt.fromExtractors([
            (req: any) => {
            // Called in WebSocket context; token will be in handshake
                 return req?.handshake?.headers?.authorization?.split(' ')[1];
                },
            ]),
        ignoreExpiration: false,
        secretOrKey: configService.get('JWT_SECRET'),
        passReqToCallback: true,
        } as StrategyOptionsWithRequest // Explicitly cast to StrategyOptionsWithRequest
        );
    }

  async validate(req: any, payload: JwtPayloadInterface) {
    const user = await this.userService.findOne(payload.id);
    if (!user) throw new UnauthorizedException('User not found');
    const { password, salt, ...safeUser } = user;
    req.user = safeUser; // Attach to socket handshake for reuse
    return safeUser;
  }
}
