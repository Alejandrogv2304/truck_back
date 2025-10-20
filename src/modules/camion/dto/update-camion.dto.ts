import {
  IsString,
  Length,
  Matches,
  IsOptional,
} from 'class-validator';


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

}
