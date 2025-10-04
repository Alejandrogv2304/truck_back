import { Admin } from 'src/modules/admin/entities/admin.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';



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
    enum: ['Disponible','Fuera de servicio'],
    default: 'Disponible',
  })
  estado: string;

  // 📌 Relación con Admin
  @ManyToOne(() => Admin, (admin) => admin.camiones, { onDelete: 'CASCADE' })
  admin: Admin;  

}
