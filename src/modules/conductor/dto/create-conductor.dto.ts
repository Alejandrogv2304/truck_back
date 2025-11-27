import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ConductorEstado } from '../entities/conductor.entity';


// ====================
// DTO Principal (Conductor)
// ====================
export class CreateConductorDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Length(3, 35)
  nombre: string;

  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @Length(3, 35)
  apellido: string;

  @IsString({ message: 'La identificación debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El número de identificación es obligatorio' })
  @Length(3, 20, { message: 'La identificación debe tener entre 3 y 20 caracteres' })
  identificacion: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de vinculación debe ser una fecha válida (YYYY-MM-DD)' })
  fecha_vinculacion?: string;

  @IsOptional()
  @IsEnum(ConductorEstado, { message: 'El estado debe ser activo o inactivo' })
  estado?: ConductorEstado;
}
