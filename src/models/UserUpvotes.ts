import { Field, ID, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
@ObjectType()
export class UserUpvotes extends BaseEntity {

  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number

  @Field(() => Int)
  @Column({ type: 'int', nullable: true })
  userId: number

  @Field(() => Int)
  @Column({ type: 'int', nullable: true })
  postId: number
}