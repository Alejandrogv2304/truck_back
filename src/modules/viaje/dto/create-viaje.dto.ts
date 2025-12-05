import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
  Max,
  IsInt,
} from 'class-validator';
import { ViajeEstado } from '../entities/viaje.entity';

export class CreateViajeDto {
  @IsString({ message: 'El lugar de origen debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El lugar de origen es obligatorio' })
  @Length(3, 50, { message: 'El lugar de origen debe tener entre 3 y 50 caracteres' })
  lugar_origen: string;

  @IsString({ message: 'El lugar de destino debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El lugar de destino es obligatorio' })
  @Length(3, 50, { message: 'El lugar de destino debe tener entre 3 y 50 caracteres' })
  lugar_destino: string;

  @IsString({ message: 'El número de manifiesto debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El número de manifiesto es obligatorio' })
  @Length(3, 40, { message: 'El número de manifiesto debe tener entre 3 y 40 caracteres' })
  num_manifiesto: string;

  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  fecha_inicio: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El valor debe ser un número con máximo 2 decimales' })
  @Min(0, { message: 'El valor no puede ser negativo' })
  @Max(999999999.99, { message: 'El valor máximo es $999,999,999.99' })
  @IsNotEmpty({ message: 'El valor es obligatorio' })
  valor: number;

  @IsOptional()
  @IsEnum(ViajeEstado, { message: 'El estado debe ser activo o inactivo' })
  estado?: ViajeEstado;

  @IsInt({ message: 'El ID del camión debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del camión es obligatorio' })
  idCamion: number;

  @IsInt({ message: 'El ID del conductor debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del conductor es obligatorio' })
  idConductor: number;
}