import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateEmpreendimentoDto {
  @IsOptional()
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  cnpj: string;

  @IsOptional()
  @IsString()
  tipo?: string;

  @IsOptional()
  @IsString()
  cidade: string;

  @IsOptional()
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
