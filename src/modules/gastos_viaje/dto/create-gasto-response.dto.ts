export class CreateGastoViajeResponseDto {
  message: string;
  data: {
    id_gasto_viaje: number;
    valor: number;
    tipo_gasto: string;
    estado: string;
  };
}

export class GastoViajeGetResponse{
  id_gasto_viaje:number;
  valor:number;
  tipo_gasto:string;
  estado:string;
}