import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UpdateUserDto } from './dtos/update-user.dto';
import { OutputUserPresenter } from './presenters/output-user.presenter';
import { InputUserPresenter } from './presenters/input-user.presenter';
import * as bcrypt from 'bcrypt';

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
          include: {
            permissions: true,
          },
        }),
        this.prisma.user.count(),
      ]);

      return {
        total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
        data: users.map((user) => new OutputUserPresenter(user)),
      };
    } catch (error) {
      console.error('Falha ao buscar usuários:', error);
      throw new InternalServerErrorException(
        'Erro interno ao processar a requisição',
      );
    }
  }

  async create(dto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const user = await this.prisma.user.create({
        data: new InputUserPresenter({
          ...dto,
          password: hashedPassword,
        }),
        include: {
          permissions: true,
        },
      });

      return {
        data: new OutputUserPresenter(user),
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
      include: {
        permissions: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Não foi possível encontrar este usuário!');
    }

    return {
      data: new OutputUserPresenter(user),
    };
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        permissions: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Não foi possível encontrar este usuário!');
    }

    return {
      data: user,
    };
  }

  async update(id: string, dto: UpdateUserDto) {
    const { data } = await this.findById(id);

    if (!data) {
      throw new NotFoundException('Não foi possível encontrar este usuário!');
    }

    await this.prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        ...dto,
      },
    });
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
