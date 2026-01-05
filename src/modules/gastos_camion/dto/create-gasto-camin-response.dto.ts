export class CreateGastoCamionResponseDto {
  message: string;
  data: {
    id_gasto_camion: number;
    valor: number;
    tipo_gasto: string;
    descripcion?: string;
    fecha: Date;
    id_camion:number;
    id_admin:number;
  };
}
export class GastoCamionResponseDto{
   id_gasto_camion: number;
    valor: number;
    tipo_gasto: string;
    descripcion?: string;
    fecha: Date;
    id_camion:number;
    id_admin:number;
}