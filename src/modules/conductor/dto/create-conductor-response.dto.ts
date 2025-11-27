export class CreateConductorResponseDto {
  message: string;
  data: {
    id_conductor: number;
    nombre: string;
    apellido: string;
    identificacion: string;
    fecha_vinculacion: Date;
    estado: string;
  };
}

export class ConductorDataDto {
  id_conductor: number;
  nombre: string;
  apellido: string;
  identificacion: string;
  fecha_vinculacion: Date;
  estado: string;
}
