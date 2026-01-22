import { Matches, IsString } from 'class-validator';
import { Admin } from 'src/modules/admin/entities/admin.entity';
import { Camion } from 'src/modules/camion/entities/camion.entity';
import { Conductor } from 'src/modules/conductor/entities/conductor.entity';
import { GastosViaje } from 'src/modules/gastos_viaje/entities/gastos_viaje.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { DateTransformer } from 'src/common/transformers/date.transformer';

export enum ViajeEstado {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

@Entity('viaje')
export class Viaje {
  @PrimaryGeneratedColumn({ name: 'id_viaje' })
  id_viaje: number;

  @Column({ length: 50 })
  lugar_origen: string;

  @Column({ length: 50 })
  lugar_destino: string;

  @Column({ unique: true, length: 40 })
  num_manifiesto: string;

  @Column({ type: 'date', transformer: new DateTransformer() })
  fecha_inicio: Date;

  @Column({
    type: 'decimal',
    precision: 15,  // Total de dígitos (enteros + decimales)
    scale: 2,       // Dígitos después del punto decimal
    default: 0,
  })
  valor: number;

  @Column({
    type: 'enum',
    enum: ViajeEstado,
    default: ViajeEstado.ACTIVO,
  })
  estado: ViajeEstado;

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

  @OneToMany(() => GastosViaje, (gastosViaje) => gastosViaje.viaje)
  gastos_viaje: GastosViaje[];
  
}