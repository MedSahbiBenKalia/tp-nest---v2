import { ConflictException, Get, Injectable, NotFoundException, Req, UseGuards } from '@nestjs/common';
import { RegisterUserDto } from './dtos/register-user.dto';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { LoginUserDto } from './dtos/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService,
                private readonly jwtService: JwtService,
    ) {}
    
    async register( registerUserDto: RegisterUserDto) {
        const salt =  await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(registerUserDto.password, salt);
        let user: User;
        try {
            user = await this.userService.create({
                ...registerUserDto,
                password: hashedPassword,
                salt: salt,
            });
        } catch (error) {
            throw new ConflictException('User already exists');
        }
        return {
            username: user.username,
            email: user.email,
            "status": "user created successfully",
        };
    }

    async login(loginUserDto: LoginUserDto) {
        const user = await this.userService.findByUsernameOrEmail(loginUserDto.username , loginUserDto.username);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const hashedPassword = await bcrypt.hash(loginUserDto.password, user.salt);
        if (hashedPassword !== user.password) {
            throw new NotFoundException('Invalid credentials');
        }
        const payload = {
            id : user.id,
            username: user.username,
            email: user.email,
            role : user.role
        };
        const token = this.jwtService.sign(payload);

        return {
            "access_token": token,
            ...payload,            
            "status": "user logged in successfully",
        };
    }

    




}
