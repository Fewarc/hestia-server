import { Field, ID, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
@ObjectType()
export class Client extends BaseEntity {

  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number

  @Field(() => Int, { nullable: true })
  @Column({ type:'int', nullable: true })
  agentId: number

  @Field(() => Int, { nullable: true })
  @Column({ type:'int', nullable: true })
  clientId: number

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', default: 0 })
  saleLevel: number

}