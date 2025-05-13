import { IsUUID, IsInt, Min, Max } from 'class-validator';

export class CreateBulkSemanaDto {
  @IsInt()
  @Min(1)
  semana: number;

  @IsInt()
  @Min(1)
  @Max(12)
  mesNumero: number;

  @IsUUID()
  anoId: string;
}
