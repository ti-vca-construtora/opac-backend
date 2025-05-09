import { IsNumber, IsUUID } from 'class-validator';

export class CreateSemanaDto {
  @IsNumber()
  numero: number;

  @IsUUID()
  mesId: string;
}
