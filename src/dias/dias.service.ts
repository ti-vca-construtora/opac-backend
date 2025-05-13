import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateDiaDto } from './dtos/create-dia.dto';

@Injectable()
export class DiasService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const dias = await this.prisma.dia.findMany();

    return {
      data: dias,
    };
  }

  async create(dto: CreateDiaDto) {
    const dia = await this.prisma.dia.create({
      data: dto,
    });

    return {
      data: dia,
    };
  }
}
