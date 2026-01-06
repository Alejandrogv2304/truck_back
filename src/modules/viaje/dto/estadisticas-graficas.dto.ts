export class EstadisticasMesDto {
    mes: string;  // Nombre del mes
    balance: number;    // Balance (ingresos - gastos)
}

export class EstadisticasGraficasResponseDto {
    data: EstadisticasMesDto[];
}
