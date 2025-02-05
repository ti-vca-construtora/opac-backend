import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreatePermissionDto } from './dtos/create-permissions.dto';
import { DeletePermissionsDto } from './dtos/delete-permissions.dto';
// import { UpdatePermissionDto } from './dtos/update-permissions.dto';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.permissions.findMany();
  }

  async findById(id: string) {
    const permission = await this.prisma.permissions.findUnique({
      where: {
        id,
      },
    });

    if (!permission) {
      throw new NotFoundException('Não foi possível encontrar esta permissão!');
    }

    return {
      data: permission,
    };
  }

  async create(createPermissionDto: CreatePermissionDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: createPermissionDto.userId,
      },
      include: {
        permissions: true,
      },
    });

    if (!user) {
      throw new NotFoundException('O usuário informado não foi encontrado!');
    }

    const existingPermission = user.permissions.find(
      (perm) => perm.area === createPermissionDto.area,
    );

    if (existingPermission) {
      const updatedPermissions = Array.from(
        new Set([
          ...existingPermission.permissions,
          ...createPermissionDto.permissions,
        ]),
      );

      const updatedPermission = await this.prisma.permissions.update({
        where: { id: existingPermission.id },
        data: {
          permissions: updatedPermissions,
        },
      });

      return {
        data: updatedPermission,
      };
    }

    const permission = await this.prisma.permissions.create({
      data: {
        area: createPermissionDto.area,
        userId: user.id,
        permissions: createPermissionDto.permissions,
      },
    });

    return {
      data: permission,
    };
  }

  // async findAll() {
  //   return this.prisma.permissions.findMany();
  // }

  // async findOne(id: string) {
  //   return this.prisma.permissions.findUnique({
  //     where: { id },
  //   });
  // }

  // async update(id: string, updatePermissionDto: UpdatePermissionDto) {
  //   return this.prisma.permissions.update({
  //     where: { id },
  //     data: updatePermissionDto,
  //   });
  // }

  async delete(id: string) {
    const { data } = await this.findById(id);

    if (!data) {
      throw new NotFoundException('Não foi possível encontrar esta permissão!');
    }

    await this.prisma.user.delete({
      where: {
        id: data.id,
      },
    });
  }

  async deleteOne(dto: DeletePermissionsDto) {
    const { data } = await this.findById(dto.permissionId);

    if (!data) {
      throw new NotFoundException('Não foi possível encontrar esta permissão!');
    }

    await this.prisma.permissions.update({
      where: {
        id: data.id,
      },
      data: {
        permissions:
          data.permissions.filter((perm) => perm !== dto.permissionToDelete) ||
          [],
      },
    });
  }
}
