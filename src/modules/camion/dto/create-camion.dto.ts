import {
  IsNotEmpty,
  IsString,
  Length,
  IsInt,
} from 'class-validator';


// ====================
// DTO Principal (Camion)
// ====================
export class CreateCamionDto {
  @IsString({ message: 'La placa debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La placa debe ser obligatorio' })
  @Length(3, 6)
  placa: string;

  @IsString({ message: 'El  debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @Length(3, 100)
  modelo: string;

}
