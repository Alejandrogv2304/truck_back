import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsDateString,
  IsInt,
  IsString,
  MaxLength,
} from 'class-validator';
import { tipoGastosCamion } from '../entities/gastos_camion.entity';

export class CreateGastoCamionDto {
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El valor debe ser un número con máximo 2 decimales' })
  @Min(0, { message: 'El valor no puede ser negativo' })
  @Max(999999999.99, { message: 'El valor máximo es $999,999,999.99' })
  @IsNotEmpty({ message: 'El valor es obligatorio' })
  valor: number;

  @IsNotEmpty({ message: 'El tipo de gasto es obligatorio' })
  @IsEnum(tipoGastosCamion, { message: 'El tipo de gasto debe ser: seguros, repuestos, llantas, bateria u otro' })
  tipo_gasto: tipoGastosCamion;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(200, { message: 'La descripción no puede exceder 200 caracteres' })
  descripcion?: string;

  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  @IsDateString({}, { message: 'La fecha debe ser una fecha válida en formato ISO (YYYY-MM-DD)' })
  fecha: Date;

  @IsNotEmpty({ message: 'El id del camión es obligatorio' })
  @IsInt({ message: 'El id del camión debe ser un número entero' })
  @Min(1, { message: 'El id del camión debe ser mayor a 0' })
  id_camion: number;
}