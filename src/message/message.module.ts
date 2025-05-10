import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message, MessageComment } from './entities/message.entity';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, MessageComment]),
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: "123456789",
      signOptions: { expiresIn: '3h' },
    }),
  ],
  providers: [MessageService, MessageGateway],
  exports: [MessageService],
})
export class MessageModule {}