import { Matches, IsString } from 'class-validator';
import { Admin } from 'src/modules/admin/entities/admin.entity';
import { Viaje } from 'src/modules/viaje/entities/viaje.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

export enum ConductorEstado {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

@Entity('conductor')
export class Conductor {
  @PrimaryGeneratedColumn({ name: 'id_conductor' })
  id_conductor: number;

  @Column({ length: 35 })
  nombre: string;

  @Column({ length: 35 })
  apellido: string;

  @Column({ unique: true, length: 20 })
  identificacion: string;

  @Column({ type: 'date' })
  fecha_vinculacion: Date;

  @Column({
    type: 'enum',
    enum: ConductorEstado,
    default: ConductorEstado.ACTIVO,
  })
  estado: ConductorEstado;

  @Column({ length: 10 })
  @IsString()
  @Matches(/^[3]\d{9}$/, {
    message: 'El número de teléfono debe tener 10 dígitos y comenzar por 3.',
  })
  telefono: string;

  // Relación con Admin
  @ManyToOne(() => Admin, (admin) => admin.conductores, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_admin' })
  admin: Admin;

  // Relación con Viajes (Un conductor -> Muchos viajes)
  @OneToMany(() => Viaje, (viaje) => viaje.conductor)
  viajes: Viaje[];
}
