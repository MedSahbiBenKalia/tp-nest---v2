import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { CvModule } from './cv/cv.module';
import { SkillModule } from './skill/skill.module';
import { DataSource } from 'typeorm';
import AppDataSource from '../data-source';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CvEventModule } from './cv-event/cv-event.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MessageModule } from './message/message.module';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EventEmitterModule.forRoot(
      {
        wildcard: true,
        delimiter: '.',
        },
    ),
    TypeOrmModule.forRoot(AppDataSource.options), 
    UserModule, 
    CvModule, 
    SkillModule, AuthModule, CvEventModule, MessageModule, MailerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
