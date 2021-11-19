import { Field, ID, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
@ObjectType()
export class Photo extends BaseEntity {

  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  offerId: number

  // @Field()
  // @Column()
  // image: any

}