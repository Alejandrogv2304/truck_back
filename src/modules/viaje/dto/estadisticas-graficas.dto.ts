export class EstadisticasMesDto {
    mes: string;  // Nombre del mes
    balance: number;    // Balance (ingresos - gastos)
}

export class EstadisticasGraficasResponseDto {
    data: EstadisticasMesDto[];
}

// DTOs para informe mensual detallado
export class DetalleViajeInformeDto {
    id_viaje: number;
    num_manifiesto: string;
    lugar_origen: string;
    lugar_destino: string;
    fecha_inicio: Date;
    camion: string;
    conductor: string;
    valor_viaje: number;
    gastos_viaje: number;
    balance_viaje: number;
}

export class InformeMensualDto {
    mes: string;
    anio: number;
    total_viajes: number;
    ingresos_totales: number;
    egresos_totales: number;
    balance_total: number;
    detalle_viajes: DetalleViajeInformeDto[];
    detalle_gastos_camion: DettallesGastosCamionDto[];
    detalle_gastos_agrupados: DettallesGastosAgrupadosDto[];
}

export class DettallesGastosCamionDto {
    valor:number;
    tipo_gasto:string;
    descripcion:string;
    fecha:Date;
}
export class DettallesGastosAgrupadosDto {
    valor:number;
    tipo_gasto:string;
}