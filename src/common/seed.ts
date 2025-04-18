import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';
import { SkillService } from '../skill/skill.service';
import { CvService } from '../cv/cv.service';
import { randEmail, randFirstName, randJobArea, randLastName, randPassword, randSkill, randWord } from '@ngneat/falso';
import { User } from '../user/entities/user.entity';
import { Skill } from '../skill/entities/skill.entity';
import { Cv } from '../cv/entities/cv.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  // Récupération des services
  const userService = app.get(UserService);
  const skillService = app.get(SkillService);
  const cvService = app.get(CvService);

  // Seed des Users
  const users: User[] = [];
  for (let i = 0; i < 10; i++) {
    users.push(await userService.create({
        name: randFirstName() + randLastName(),
      email: randEmail(),
      password: randPassword()
    }));
  }

  // Seed des Skills
  const skills : Skill[] = [];
  for (let i = 0; i < 15; i++) {
    skills.push(await skillService.create({
      designation: randSkill()
    }));
  }

  // Seed des CVs
  for (const user of users) {
    for (let i = 0; i < 3; i++) {
      await cvService.create({
        name: randLastName(),
        firstname: randFirstName(),
        userId: user.id,
        job: randJobArea(),
        email: randEmail(),
        age : Math.floor(Math.random() * 50) + 20,
        Cin : Math.floor(Math.random() * 10000000) + 1000000,
        skillIds: skills
          .sort(() => 0.5 - Math.random())
          .slice(0, 5)
          .map(skill => skill.id)
      });
    }
  }

  await app.close();
}
bootstrap();
