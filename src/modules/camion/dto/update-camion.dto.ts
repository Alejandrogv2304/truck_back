import {
  IsString,
  Length,
  Matches,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { CamionEstado } from '../entities/camion.entity';


// ====================
// DTO Actualizar Camión
// ====================
export class UpdateCamionDto {
  @IsString({ message: 'La placa debe ser una cadena de texto' })
  @IsOptional()
  @Length(6, 6, {
    message: 'La placa debe tener exactamente 6 caracteres.',
  })
   @Matches(/^[A-Z]{3}\d{3}$/, {
    message: 'La placa no tiene un formato válido. Ejemplo: ABC123',
  })
  placa: string;

  @IsString({ message: 'El modelo debe ser una cadena de texto' })
  @IsOptional()
  @Length(3, 100)
  modelo: string;

   @IsOptional()
   @IsEnum(CamionEstado, { message: 'El estado debe ser activo o inactivo' })
   estado?: CamionEstado;

}
