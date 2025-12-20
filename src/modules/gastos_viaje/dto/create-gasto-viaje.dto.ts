import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { gastosViajeEstado, tipoGastosViaje } from '../entities/gastos_viaje.entity';

export class CreateGastoViajeDto {
 

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El valor debe ser un número con máximo 2 decimales' })
  @Min(0, { message: 'El valor no puede ser negativo' })
  @Max(999999999.99, { message: 'El valor máximo es $999,999,999.99' })
  @IsNotEmpty({ message: 'El valor es obligatorio' })
  valor: number;

  @IsOptional()
  @IsEnum(gastosViajeEstado, { message: 'El estado debe ser activo o inactivo' })
  estado?: gastosViajeEstado;

  @IsNotEmpty({ message: 'El tipo de gasto es obligatorio' })
  @IsEnum(tipoGastosViaje, { message: 'El tipo de gasto debe ser combustible,peajes, viaticos,otro' })
  tipo_gasto: tipoGastosViaje;

 
}