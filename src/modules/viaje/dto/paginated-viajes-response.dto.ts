import { ViajeDataDto } from './create-viaje-response.dto';

export class PaginatedViajesResponseDto {
  data: ViajeDataDto[];
  
  meta: {
    total: number;           // Total de registros
    page: number;            // Página actual
    limit: number;           // Registros por página
    totalPages: number;      // Total de páginas
    hasNextPage: boolean;    // ¿Hay página siguiente?
    hasPreviousPage: boolean; // ¿Hay página anterior?
  };
}
