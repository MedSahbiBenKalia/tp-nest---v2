import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt-strategie';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserService } from 'src/user/user.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { WsJwtStrategy } from './strategies/ws-jwt-stategies';

@Module({
  imports: [UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '3h' },
  }),
],
  controllers: [AuthController],
  providers: [AuthService , JwtStrategy , JwtAuthGuard ,WsJwtGuard,WsJwtStrategy ]
})
export class AuthModule {}
