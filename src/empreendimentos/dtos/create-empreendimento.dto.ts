import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateEmpreendimentoDto {
  @IsString()
  nome: string;

  @IsString()
  cnpj: string;

  @IsOptional()
  @IsString()
  tipo?: string;

  @IsString()
  cidade: string;

  @IsString()
  uf: string;

  @IsOptional()
  @IsDateString()
  entregaData?: Date;

  @IsOptional()
  @IsString()
  cheque?: string;

  @IsOptional()
  @IsString()
  chequeData?: string;
}
