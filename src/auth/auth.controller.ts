import { Controller, Post, Request, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './auth-local.guard';
import { AuthService } from './auth.service';
import { UserOutputDto } from 'src/users/dtos/output-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { EnvConfigService } from 'src/shared/env-config/env-config.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: EnvConfigService,
  ) {}

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
  login(
    @Request() req: { user: UserOutputDto },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user } = req;
    const { access_token } = this.authService.login(user);

    const isProd = this.configService.getNodeEnv() === 'production';

    res.cookie('opac_access_token', access_token, {
      httpOnly: isProd, // true em prod, false em dev
      secure: isProd, // true em prod (HTTPS), false em dev (HTTP)
      sameSite: isProd ? 'none' : 'lax', // cross-site em prod, lax em dev
      maxAge: 24 * 60 * 60 * 1000,
    });

    return { access_token };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('opac_access_token');

    return { message: 'Logout realizado com sucesso' };
  }
}
