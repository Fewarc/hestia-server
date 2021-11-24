import { Field, Float, ID, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OfferCategory } from "../enums/OfferCategory";
import { OfferType } from "../enums/OfferType";

@Entity()
@ObjectType()
export class Offer extends BaseEntity {

  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number

  @Field(() => String, { nullable: true })
  @Column('varchar', { length: 40, nullable: true })
  title: string

  @Field(() => String, { nullable: true })
  @Column('varchar', { length: 1000, nullable: true })
  description: string

  @Field(() => Float)
  @Column({ type: 'float', nullable: true })
  price: number

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true, default: 0 })
  ownerId: number

  // @Field()
  // @Column()        TODO
  // agency

  @Field(() => OfferCategory)
  @Column({ type: 'enum', enum: OfferCategory, default: OfferCategory.RESIDENTIAL })
  category: OfferCategory

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: false })
  furnished: boolean
  
  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true })
  area: number

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  floor: number | null
  
  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  numberOfRooms: number | null

  @Field(() => String, { nullable: true })
  @Column('varchar', { length: 3, nullable: true })
  currency: string

  @Field(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  negotiable: boolean

  @Field(() => OfferType)
  @Column({ type: 'enum', enum: OfferType, default: OfferType.DISPOSAL })
  offerType: OfferType

  @Field(() => String)
  @Column('varchar', { nullable: true })
  address: string

  @Field(() => Float)
  @Column({ type: 'float', nullable: true })
  lat: number

  @Field(() => Float)
  @Column({ type: 'float', nullable: true })
  lng: number

  @Field(() => String)
  @Column({ type: 'varchar', nullable: true })
  uploads: string

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

}