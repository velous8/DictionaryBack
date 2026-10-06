import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/token.entity';
import { EmailService } from './email/email.service';
import { TokenService } from './token/token.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';



@Module({
   imports: [
    TypeOrmModule.forFeature([User, RefreshToken]),
    JwtModule
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, TokenService, JwtAuthGuard],
  exports: [TokenService,JwtAuthGuard],
})
export class AuthModule {}
