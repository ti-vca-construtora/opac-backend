import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateAnoDto } from './dtos/create-ano.dto';

@Injectable()
export class AnosService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const anos = await this.prisma.ano.findMany();

    return {
      data: anos,
    };
  }

  async create(dto: CreateAnoDto) {
    const ano = await this.prisma.ano.create({
      data: dto,
    });

    return {
      data: ano,
    };
  }
}
