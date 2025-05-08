import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class CreateMesDto {
  @IsInt()
  @Min(1)
  @Max(12)
  numero: number;

  @IsUUID()
  anoId: string;
}
