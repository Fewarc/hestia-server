import { Field, ID, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
@ObjectType()
export class EventParticipants extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number
  
  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  eventId: number

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  participantId: number
}