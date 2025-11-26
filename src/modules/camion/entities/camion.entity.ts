import { Admin } from 'src/modules/admin/entities/admin.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

export enum CamionEstado {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

@Entity('camion')
export class Camion {
  @PrimaryGeneratedColumn({ name: 'id_camion' })
  id_camion: number;

  @Column({unique:true, length: 6 })
  placa: string;

  @Column({ length: 100 })
  modelo: string;

  
  @Column({
    type: 'enum',
    enum: CamionEstado,
  })
  estado: CamionEstado;

  //  Relación con Admin
  @ManyToOne(() => Admin, (admin) => admin.camiones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_admin' }) 
  admin: Admin;  

}
