import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateAprovacaoDto } from './dtos/create-aprovacao.dto';
import { UpdateAprovacaoDto } from './dtos/update-aprovacao.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AprovacaoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAprovacaoDto) {
    // Verificar se o empreendimento existe
    const empreendimento = await this.prisma.empreendimento.findUnique({
      where: { id: dto.empreendimentoId },
    });

    if (!empreendimento) {
      throw new NotFoundException(
        `Empreendimento com ID ${dto.empreendimentoId} não encontrado`,
      );
    }

    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `Usuário com ID ${dto.userId} não encontrado`,
      );
    }

    // Para aditivos, validar se mês e ano foram fornecidos
    if (dto.type === 'ADITIVO' && (!dto.mes || !dto.ano)) {
      throw new BadRequestException(
        'Mês e ano são obrigatórios para solicitações do tipo ADITIVO',
      );
    }

    // Para aditivos, verificar se já existe medição no mesmo mês/ano
    if (dto.type === 'ADITIVO') {
      const existingMedicao = await this.prisma.medicaoMensal.findFirst({
        where: {
          empreendimentoId: dto.empreendimentoId,
          mes: dto.mes,
          ano: dto.ano,
        },
      });

      if (existingMedicao) {
        throw new ConflictException(
          `Já existe uma medição para o mês ${dto.mes}/${dto.ano}. Não é possível solicitar um aditivo.`,
        );
      }
    }

    // Verificar se já existe uma aprovação pendente do mesmo tipo para este empreendimento
    const existingAprovacao = await this.prisma.aprovacao.findFirst({
      where: {
        empreendimentoId: dto.empreendimentoId,
        type: dto.type,
        approved: false,
      },
    });

    if (existingAprovacao) {
      throw new ConflictException(
        `Já existe uma aprovação ${dto.type} pendente para este empreendimento`,
      );
    }

    return this.prisma.aprovacao.create({
      data: {
        type: dto.type,
        valor: dto.valor,
        obs: dto.obs,
        anexoLink: dto.anexoLink,
        mes: dto.mes,
        ano: dto.ano,
        userId: dto.userId,
        empreendimentoId: dto.empreendimentoId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        empreendimento: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });
  }

  async approveAprovacao(id: string, userId: string) {
    const aprovacao = await this.findOne(id);

    // Verificar se o usuário tem permissão para aprovar (é APPROVER ou MASTER)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('O usuário informado não foi encontrado');
    }

    const canApprove =
      user.roles.includes(Role.APPROVER) || user.roles.includes(Role.MASTER);

    if (!canApprove) {
      throw new ForbiddenException(
        'Você não tem permissão para aprovar solicitações',
      );
    }

    // Validar se mês e ano estão presentes para aditivos
    if (aprovacao.type === 'ADITIVO' && (!aprovacao.mes || !aprovacao.ano)) {
      throw new BadRequestException(
        'Mês e ano são obrigatórios para aprovações do tipo ADITIVO',
      );
    }

    // Para aditivos, verificar se já existe medição no mesmo mês/ano
    if (aprovacao.type === 'ADITIVO') {
      const existingMedicao = await this.prisma.medicaoMensal.findFirst({
        where: {
          empreendimentoId: aprovacao.empreendimentoId,
          mes: aprovacao.mes || undefined,
          ano: aprovacao.ano || undefined,
        },
      });

      if (existingMedicao) {
        throw new ConflictException(
          `Já existe uma medição para o mês ${aprovacao.mes}/${aprovacao.ano}. Não é possível adicionar um aditivo.`,
        );
      }
    }

    // Aprovar a solicitação
    const updatedAprovacao = await this.prisma.aprovacao.update({
      where: { id },
      data: { approved: true },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        empreendimento: true,
      },
    });

    // Aplicar a aprovação conforme o tipo
    if (updatedAprovacao.type === 'EXECUTIVO') {
      // Atualizar orçamento executivo do empreendimento
      await this.prisma.empreendimento.update({
        where: { id: updatedAprovacao.empreendimentoId },
        data: { orcamentoExecutivo: updatedAprovacao.valor },
      });
    } else if (updatedAprovacao.type === 'ADITIVO') {
      // Criar registro de aditivo usando o mês e ano da aprovação
      await this.prisma.aditivo.create({
        data: {
          aditivo: updatedAprovacao.valor,
          obs: updatedAprovacao.obs,
          anexoLink: updatedAprovacao.anexoLink,
          mes: updatedAprovacao.mes!,
          ano: updatedAprovacao.ano!,
          empreendimentoId: updatedAprovacao.empreendimentoId,
        },
      });
    }

    return updatedAprovacao;
  }

  async getAll(
    page: number = 1,
    pageSize: number = 20,
    type?: string,
    approved?: boolean,
    empreendimentoId?: string,
  ) {
    const skip = (page - 1) * pageSize;
    const where = {
      ...(type && { type }),
      ...(approved !== undefined && { approved }),
      ...(empreendimentoId && { empreendimentoId }),
    };

    const [aprovacoes, total] = await this.prisma.$transaction([
      this.prisma.aprovacao.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          empreendimento: {
            select: {
              id: true,
              nome: true,
              cidade: true,
              uf: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.aprovacao.count({ where }),
    ]);

    return {
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
      data: aprovacoes,
    };
  }

  async findOne(id: string) {
    const aprovacao = await this.prisma.aprovacao.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        empreendimento: {
          select: {
            id: true,
            nome: true,
            cidade: true,
            uf: true,
          },
        },
      },
    });

    if (!aprovacao) {
      throw new NotFoundException(`Aprovação com id ${id} não encontrada`);
    }

    return aprovacao;
  }

  async update(id: string, dto: UpdateAprovacaoDto) {
    await this.findOne(id);

    return this.prisma.aprovacao.update({
      where: { id },
      data: dto,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        empreendimento: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    try {
      return await this.prisma.aprovacao.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(
        `Aprovação com id ${id} não encontrada` + error,
      );
    }
  }

  async getByEmpreendimento(empreendimentoId: string) {
    const empreendimento = await this.prisma.empreendimento.findUnique({
      where: { id: empreendimentoId },
    });

    if (!empreendimento) {
      throw new NotFoundException(
        `Empreendimento com ID ${empreendimentoId} não encontrado`,
      );
    }

    return this.prisma.aprovacao.findMany({
      where: { empreendimentoId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
