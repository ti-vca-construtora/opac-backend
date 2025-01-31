import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { UserDto } from './dtos/user.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAll(page: number = 1, pageSize: number = 20) {
    try {
      const skip = (page - 1) * pageSize;

      const [users, total] = await this.prisma.$transaction([
        this.prisma.user.findMany({
          skip,
          take: pageSize,
        }),
        this.prisma.user.count(),
      ]);

      return {
        total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
        data: users,
      };
    } catch (error) {
      console.error('Falha ao buscar usuários:', error);
      throw new InternalServerErrorException(
        'Erro interno ao processar a requisição',
      );
    }
  }

  async create(dto: UserDto) {
    try {
      const user = await this.prisma.user.create({
        data: {
          ...dto,
        },
      });

      return {
        data: user,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Este usuário já existe!');
        }
      }

      throw error;
    }
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('Não foi possível encontrar este usuário!');
    }

    return {
      data: user,
    };
  }

  async delete(id: string) {
    const { data } = await this.findById(id);

    if (!data) {
      throw new NotFoundException('Não foi possível encontrar este usuário!');
    }

    await this.prisma.user.delete({
      where: {
        id: data.id,
      },
    });
  }
}
