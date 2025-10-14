import { Camion } from 'src/modules/camion/entities/camion.entity';
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
  

}
