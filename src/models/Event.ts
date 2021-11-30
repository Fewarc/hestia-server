import { Field, ID, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
@ObjectType()
export class Event extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true})
  ownerId: number

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', nullable: true })
  eventName: string

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', nullable: true })
  eventDescription: string

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamptz', nullable: true, default: null })
  eventOccuranceDate: Date

  @Field(() => Int, { nullable: true })
  year: number

  @Field(() => Int, { nullable: true })
  month: number

  @Field(() => Int, { nullable: true })
  day: number

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date
}