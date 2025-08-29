import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateMedicaoMensalDto {
  @ApiProperty({ description: 'Porcentagem de avanço físico de obra' })
  @IsNotEmpty()
  @IsNumber()
  ampFisico: number;
}
