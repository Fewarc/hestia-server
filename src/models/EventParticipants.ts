import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity } from "typeorm";

@Entity()
@ObjectType()
export class EventParticipants extends BaseEntity {
  @Field(() => Int)
  @Column({ type: 'int', nullable: true })
  eventId: number

  @Field(() => Int)
  @Column({ type: 'int', nullable: true })
  participantId: number
}