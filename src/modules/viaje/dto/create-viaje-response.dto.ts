export class CreateViajeResponseDto {
  message: string;
  data: {
    id_viaje: number;
    valor: number;
    num_manifiesto: string;
    lugar_origen: string;
    lugar_destino: string;
    idCamion: number;
    idConductor:number;
    fecha_inicio: Date;
    estado: string;
  };
}