import { Camion } from 'src/modules/camion/entities/camion.entity';
import { Conductor } from 'src/modules/conductor/entities/conductor.entity';
import { GastosViaje } from 'src/modules/gastos_viaje/entities/gastos_viaje.entity';
import { Viaje } from 'src/modules/viaje/entities/viaje.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';



@Entity('admin')
export class Admin {
  @PrimaryGeneratedColumn({ name: 'id_admin' })
  id_admin: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  apellido: string;

  @Column({ length: 150, unique: true })
  correo: string;

  @Column({ length: 256 })
  hash: string;

  @Column({ length: 256 })
  salt: string;

  @Column({ length: 10 })
  estado: string;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  fecha_creacion: Date;

  // Relación con Camiones
  @OneToMany(() => Camion, (camion) => camion.admin)
  camiones: Camion[];
  
  // Relación con Conductores
  @OneToMany(() => Conductor, (conductor) => conductor.admin)
  conductores: Conductor[];

  // Relación con Viajes
  @OneToMany(() => Viaje, (viaje) => viaje.admin)
  viajes: Viaje[];

   // Relación con Gastos de Viajes
  @OneToMany(() => GastosViaje, (gastosViaje) => gastosViaje.admin)
  gastos_viaje: GastosViaje[];

}
