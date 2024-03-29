import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm'
import { IsNotEmpty, IsOptional, Length, Min } from 'class-validator'
import { UrbanTermDefinition } from './UrbanTermDefinition'

@Entity()
export class UrbanTerm {
  @PrimaryGeneratedColumn()
  @IsOptional()
    id: number

  @Column({ type: 'varchar', nullable: false })
  @IsNotEmpty({ message: 'term is Required' })
    urbanterm: string

  @OneToMany(() => UrbanTermDefinition, (def) => def.urbanterm, { onDelete: 'CASCADE' })
    definitions: UrbanTermDefinition[]

  @Column({ type: 'integer', nullable: false, default: 0 })
  @IsOptional()
  @Min(0, { message: 'Num Definitions must not be less than zero' })
    numofdefinitions: number
}
