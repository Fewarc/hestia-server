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
  floor: number
  
  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  numberOfRooms: number

  @Field(() => String, { nullable: true })
  @Column('varchar', { length: 3, nullable: true })
  currency: string

  @Field(() => Boolean)
  @Column({ type: 'boolean', nullable: true })
  negotiable: boolean

  @Field(() => OfferType)
  @Column({ type: 'enum', enum: OfferType, default: OfferType.DISPOSAL })
  offerType: OfferType

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

}