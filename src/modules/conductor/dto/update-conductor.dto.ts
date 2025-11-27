import {
  IsOptional,
  IsString,
  Length,
  IsEnum,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import { ConductorEstado } from '../entities/conductor.entity';

export class UpdateConductorDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @Length(3, 35, { message: 'El nombre debe tener entre 3 y 35 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido no puede estar vacío' })
  @Length(3, 35, { message: 'El apellido debe tener entre 3 y 35 caracteres' })
  apellido?: string;

  @IsOptional()
  @IsString({ message: 'La identificación debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La identificación no puede estar vacía' })
  @Length(3, 20, { message: 'La identificación debe tener entre 3 y 20 caracteres' })
  identificacion?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de vinculación debe ser una fecha válida (YYYY-MM-DD)' })
  fecha_vinculacion?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'El estado no puede estar vacío' })
  @IsEnum(ConductorEstado, { message: 'El estado debe ser activo o inactivo' })
  estado?: ConductorEstado;
}
