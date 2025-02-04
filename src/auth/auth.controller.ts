/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './auth-local.guard';
import { AuthService } from './auth.service';
import { UserOutputDto } from 'src/users/dtos/output-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({
    summary: 'Autenticar usuário',
    description: 'Realiza o login do usuário e retorna um token JWT',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'usuario@empresa.com' },
        password: { type: 'string', example: 'Senha123!' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário autenticado com sucesso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  login(@Request() req) {
    const { user }: { user: UserOutputDto } = req;

    return this.authService.login(user);
  }
}
