import { CamionEstado } from "../entities/camion.entity";

export class CreateCamionResponseDto {
  message: string;
  CamionId: number;
}

export class ResponseGetCamionesDto{
  id_camion:number;
  placa:string;
  modelo:string;
  estado: CamionEstado;
}

export class CamionSelectDto{
  id_camion:number;
  placa:string;
}