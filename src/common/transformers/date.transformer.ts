import { ValueTransformer } from 'typeorm';

/**
 * Transformador para manejar fechas tipo DATE sin conversiones de zona horaria.
 * Guarda y lee fechas en formato YYYY-MM-DD puro.
 */
export class DateTransformer implements ValueTransformer {
  /**
   * Convierte Date a string YYYY-MM-DD para guardar en BD
   */
  to(value: Date | string | null): string | null {
    if (!value) return null;
    
    if (typeof value === 'string') {
      // Si ya es string, extraer solo YYYY-MM-DD
      return value.split('T')[0];
    }
    
    // Si es Date, formatear a YYYY-MM-DD en zona horaria local
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Convierte string YYYY-MM-DD de BD a Date en zona horaria local
   */
  from(value: string | null): Date | null {
    if (!value) return null;
    
    // Parsear como fecha local (no UTC)
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }
}
