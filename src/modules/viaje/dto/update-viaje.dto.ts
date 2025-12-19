import {
  IsString,
  Length,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsInt,
} from 'class-validator';
import { ViajeEstado } from '../entities/viaje.entity';

/**
 * DTO para actualización parcial de viajes
 * Todos los campos son opcionales para permitir updates selectivos
 */
export class UpdateViajeDto {
  @IsOptional()
  @IsString({ message: 'El lugar de origen debe ser una cadena de texto' })
  @Length(3, 50, { message: 'El lugar de origen debe tener entre 3 y 50 caracteres' })
  lugar_origen?: string;

  @IsOptional()
  @IsString({ message: 'El lugar de destino debe ser una cadena de texto' })
  @Length(3, 50, { message: 'El lugar de destino debe tener entre 3 y 50 caracteres' })
  lugar_destino?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El valor debe ser un número con máximo 2 decimales' })
  @Min(0, { message: 'El valor no puede ser negativo' })
  @Max(999999999.99, { message: 'El valor máximo es $999,999,999.99' })
  valor?: number;

  @IsOptional()
  @IsEnum(ViajeEstado, { message: 'El estado debe ser activo o inactivo' })
  estado?: ViajeEstado;

  // NOTA: num_manifiesto, fecha_inicio, idCamion, idConductor 
  // NO están incluidos por seguridad/integridad de datos
 
}