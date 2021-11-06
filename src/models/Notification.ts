import { Field, ID, Int, ObjectType, registerEnumType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { NotificationType } from "../enums/NotificationType";
import { User } from "./User";

@Entity()
@ObjectType()
export class Notification extends BaseEntity {

  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number

  @Field(() => Int)
  @ManyToOne(() => User, user => user.notification)
  user: User  

  @Field(() => String)
  @Column('varchar', { length: 100 })
  content: string

  @Field(() => NotificationType)
  @Column({ type: 'enum', enum: NotificationType, default: NotificationType.NOTIFICATION })
  type: NotificationType
}