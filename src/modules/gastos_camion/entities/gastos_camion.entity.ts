import { Admin } from 'src/modules/admin/entities/admin.entity';
import { Camion } from 'src/modules/camion/entities/camion.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';



export enum tipoGastosCamion {
  seguros = 'seguros',
  repuestos = 'repuestos',
  llantas = 'llantas',
  bateria = 'bateria',
  lavadas = 'lavadas',
  nomina = 'nomina',
  otro= 'otro'
}

@Entity('gastos_camion')
export class GastosCamion {
  @PrimaryGeneratedColumn({ name: 'id_gasto_camion' })
  id_gasto_camion: number;

  
 
  @Column({
    type: 'decimal',
    precision: 18,  // Total de dígitos (enteros + decimales)
    scale: 2,       // Dígitos después del punto decimal
    default: 0,
  })
  valor: number;

  
   @Column({
    type: 'enum',
    enum: tipoGastosCamion,
    default: tipoGastosCamion.otro,
  })
  tipo_gasto: tipoGastosCamion;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ length: 200, nullable: true , type: 'varchar'})
  descripcion: string;

  @Column({ name: 'id_admin' })
  id_admin: number;

  @Column({ name: 'id_camion' })
  id_camion: number;

  // Relación con Admin
  @ManyToOne(() => Admin, (admin) => admin.gastos_camion, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_admin' })
  admin: Admin;

  // Relación con Camión (Muchos gastos -> Un camión)
  @ManyToOne(() => Camion, (camion) => camion.gastos_camion, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_camion' })
  camion: Camion;


  
}