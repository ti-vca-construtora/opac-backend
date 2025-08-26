import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateMedicaoMensalDto {
  @ApiProperty({ description: 'Mês de referência (1-12)' })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  mes: number;

  @ApiProperty({ description: 'Ano de referência' })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  ano: number;

  @ApiProperty({ description: 'Total de distorções' })
  @IsNumber()
  @IsPositive()
  totalDistorcoes: number;

  @ApiProperty({ description: 'Total de custo por nível' })
  @IsNumber()
  @IsPositive()
  totalCustoPorNivel: number;

  @ApiProperty({ description: 'Total de estoque' })
  @IsNumber()
  @IsPositive()
  totalEstoque: number;

  @ApiProperty({ description: 'Total de medições' })
  @IsNumber()
  @IsPositive()
  totalMedicoes: number;

  @ApiProperty({ description: 'Custo incorrido' })
  @IsNumber()
  @IsPositive()
  custoIncorrido: number;

  @ApiProperty({ description: 'ID do empreendimento no Sienge' })
  @IsNumber()
  @IsPositive()
  idSienge: number;
}
