import { Admin } from 'src/modules/admin/entities/admin.entity';
import { GastosCamion } from 'src/modules/gastos_camion/entities/gastos_camion.entity';
import { Viaje } from 'src/modules/viaje/entities/viaje.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

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
  @ManyToOne(() => Admin, (admin) => admin.camiones, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_admin' }) 
  admin: Admin;

  // Relación con Viajes (Un camión -> Muchos viajes)
  @OneToMany(() => Viaje, (viaje) => viaje.camion)
  viajes: Viaje[];

   // Relación con Gastos (Un camión -> Muchos gastos)
  @OneToMany(() => GastosCamion, (gastosCamion) => gastosCamion.camion)
  gastos_camion: GastosCamion[];

}
