import { Admin } from 'src/modules/admin/entities/admin.entity';
import { Viaje } from 'src/modules/viaje/entities/viaje.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

export enum gastosViajeEstado {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

export enum tipoGastosViaje {
  peajes = 'peajes',
  combustible = 'combustible',
  viaticos = 'viaticos',
  otro= 'otro'
}

@Entity('gastos_viaje')
export class GastosViaje {
  @PrimaryGeneratedColumn({ name: 'id_gasto_viaje' })
  id_gasto_viaje: number;

  
 
  @Column({
    type: 'decimal',
    precision: 15,  // Total de dígitos (enteros + decimales)
    scale: 2,       // Dígitos después del punto decimal
    default: 0,
  })
  valor: number;

  @Column({
    type: 'enum',
    enum: gastosViajeEstado,
    default: gastosViajeEstado.ACTIVO,
  })
  estado: gastosViajeEstado;


   @Column({
    type: 'enum',
    enum: tipoGastosViaje,
    default: tipoGastosViaje.otro,
  })
  tipo_gasto: tipoGastosViaje;

  // Relación con Admin
  @ManyToOne(() => Admin, (admin) => admin.gastos_viaje, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_admin' })
  admin: Admin;

  // Relación con Viaje (Muchos gastos -> Un viaje)
  @ManyToOne(() => Viaje, (viaje) => viaje.gastos_viaje, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_viaje' })
  viaje: Viaje;


  
}