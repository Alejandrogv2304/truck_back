import { Admin } from 'src/modules/admin/entities/admin.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

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

  // Relación con Admin
  @ManyToOne(() => Admin, (admin) => admin.conductores, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_admin' })
  admin: Admin;
}
