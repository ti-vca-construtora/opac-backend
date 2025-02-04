/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './auth-local.guard';
import { AuthService } from './auth.service';
import { UserOutputDto } from 'src/users/dtos/output-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req) {
    const { user }: { user: UserOutputDto } = req;

    return this.authService.login(user);
  }
}
