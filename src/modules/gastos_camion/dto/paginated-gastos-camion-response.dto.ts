import { GastoCamionResponseDto } from './create-gasto-camin-response.dto';

export class PaginatedGastosCamionResponseDto {
  data: GastoCamionResponseDto[];
  
  meta: {
    total: number;           // Total de registros
    page: number;            // Página actual
    limit: number;           // Registros por página
    totalPages: number;      // Total de páginas
    hasNextPage: boolean;    // ¿Hay página siguiente?
    hasPreviousPage: boolean; // ¿Hay página anterior?
  };
}
