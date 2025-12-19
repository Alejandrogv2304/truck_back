import { Matches, IsString } from 'class-validator';
import { Admin } from 'src/modules/admin/entities/admin.entity';
import { Camion } from 'src/modules/camion/entities/camion.entity';
import { Conductor } from 'src/modules/conductor/entities/conductor.entity';
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
  @PrimaryGeneratedColumn({ name: 'id_gastos_viaje' })
  id_gastos_viaje: number;

  

 
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
    enum: gastosViajeEstado,
    default: gastosViajeEstado.ACTIVO,
  })
  tipo_gasto: gastosViajeEstado;

  // Relación con Admin
  @ManyToOne(() => Admin, (admin) => admin.viajes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_admin' })
  admin: Admin;

  // Relación con Camion (Muchos viajes -> Un camión)
  @ManyToOne(() => Camion, (camion) => camion.viajes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_camion' })
  camion: Camion;

  // Relación con Conductor (Muchos viajes -> Un conductor)
  @ManyToOne(() => Conductor, (conductor) => conductor.viajes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_conductor' })
  conductor: Conductor;

  
}