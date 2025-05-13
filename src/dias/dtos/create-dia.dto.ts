import { IsDateString, IsNumber, IsUUID, Max, Min } from 'class-validator';

export class CreateDiaDto {
  @IsNumber()
  @Min(1)
  @Max(31)
  numero: number;

  @IsDateString()
  data: Date;

  @IsUUID()
  semanaId: string;
}
