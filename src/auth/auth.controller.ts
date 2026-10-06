import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Redirect, Req, HttpCode, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import type { Response } from 'express';
import { AuthResponse, UserData, FullAuthData } from './interfaces/user.interface';


@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setRefreshCookie(res: Response, userData:  FullAuthData): void{
    res.cookie('refreshToken', userData.refreshToken, { maxAge: 30*24*60*60*1000, httpOnly: true, secure: false, sameSite: 'strict' });
}


  @Post('/register')
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response): Promise<AuthResponse>{
    const userData = await this.authService.register(registerDto);
    this.setRefreshCookie(res, userData)
    return{
      user: userData.user,
      accessToken: userData.accessToken,
    }
  };
  
  @Post('/login')
  async login(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response): Promise<AuthResponse>{
    const userData = await this.authService.login(registerDto);
    this.setRefreshCookie(res, userData)
    return{
      user: userData.user,
      accessToken: userData.accessToken,
    }
  };

  @Post('/logout')
  @HttpCode(200)
  async logout(@Req() req: Request & { cookies: Record<string, string> }, @Res({ passthrough: true }) res: Response): Promise<{ success: boolean }>{
    const {refreshToken} = req.cookies
    await this.authService.logout(refreshToken)
    res.clearCookie('refreshToken')
    return { success: true };
  }


  @Get('/activate/:activationLink')
  async activate(@Param('activationLink') activationLink: string, @Res() res: Response): Promise<void>{
    await this.authService.activate(activationLink)
    res.redirect(
      `${process.env.CLIENT_URL}`
    )
  };


  @Post('/refresh')
  async refresh(@Req() req: Request & { cookies: Record<string, string> }, @Res({ passthrough: true }) res: Response): Promise<AuthResponse>{
    const {refreshToken} = req.cookies
    const userData = await this.authService.refresh(refreshToken);
    this.setRefreshCookie(res, userData)
    return{
      user: userData.user,
      accessToken: userData.accessToken,
    }
  };
}


