import { Controller, Post, Body, Get, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetPasswordTokenDto } from './dto/get-password-token.dto';
import { GetDiscordTokenDto } from './dto/get-discord-token.dto';
import { CheckLoginDto } from './dto/check-login.dto';
import { RegisterDto } from './dto/register.dto';
import { DiscordPromptInterface, LoginAvailableInterface, LoginResponseInterface } from '@dfcomps/auth';
import { UserAccessInterface } from '../../shared/interfaces/user-access.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('get-password-token')
  getPasswordToken(@Body() { login, password }: GetPasswordTokenDto): Promise<LoginResponseInterface> {
    return this.authService.getPasswordToken(login, password);
  }

  @Post('get-discord-token')
  getDiscordToken(@Body() { discordAccessToken }: GetDiscordTokenDto): Promise<LoginResponseInterface> {
    return this.authService.getDiscordToken(discordAccessToken);
  }

  @Post('check-login')
  checkLogin(@Body() { login }: CheckLoginDto): Promise<LoginAvailableInterface> {
    return this.authService.checkLogin(login);
  }

  @Post('register')
  register(@Body() { login, discordAccessToken }: RegisterDto): Promise<LoginResponseInterface> {
    return this.authService.register(login, discordAccessToken);
  }

  @Get('discord-prompt')
  getDiscordPrompt(@Headers('X-Auth') accessToken: string | undefined): Promise<DiscordPromptInterface> {
    return this.authService.getDiscordPrompt(accessToken);
  }

  @Get('user')
  async getUser(@Headers('X-Auth') accessToken: string | undefined): Promise<number | null> {
    const info = await this.authService.getUserInfoByAccessToken(accessToken);
    return info.userId;
  }
  @Get('user-info')
  getUserInfo(@Headers('X-Auth') accessToken: string | undefined): Promise<UserAccessInterface> {
    return this.authService.getUserInfoByAccessToken(accessToken);
  }

  @Post('link-discord')
  linkDiscord(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() { discordAccessToken }: GetDiscordTokenDto,
  ): Promise<LoginResponseInterface> {
    return this.authService.linkDiscord(accessToken, discordAccessToken);
  }
}
