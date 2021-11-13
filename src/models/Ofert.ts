import { Field, Float, ID, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OfertCategory } from "../enums/OfertCategory";

@Entity()
@ObjectType()
export class Ofert extends BaseEntity {

  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number

  @Field(() => String, { nullable: true })
  @Column('varchar', { length: 40, nullable: true })
  title: string

  @Field(() => String, { nullable: true })
  @Column('varchar', { length: 100, nullable: true })
  descritpion: string

  @Field(() => Float)
  @Column({ type: 'float', nullable: true })
  price: number

  // @Field()
  // @Column()
  // coordinates

  // @Field()
  // @Column()
  // agency

  // @Field()
  // @Column()
  // agent

  @Field(() => OfertCategory)
  @Column({ type: 'enum', enum: OfertCategory, default: OfertCategory.RESIDENTIAL })
  category: OfertCategory

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

}