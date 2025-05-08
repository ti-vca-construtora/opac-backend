import { IsNumber } from 'class-validator';

export class CreateAnoDto {
  @IsNumber()
  ano: number;
}
