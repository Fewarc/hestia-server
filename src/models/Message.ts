import { Field, ID, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
@ObjectType()
export class Message extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  toId: number

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  fromId: number

  @Field(() => String)
  @Column({ type: 'varchar', nullable: true })
  content: string

  // @Field()
  // @Column()
  // attachment: ?

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  sentAt: Date
}
