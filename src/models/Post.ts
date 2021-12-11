import { Field, ID, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
@ObjectType()
class Post extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number

  // @Field(() => Int)
  // @Column({ type: 'int', nullable: true })
  // threadId: number

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  replyToId: number | null

  @Field(() => Int)
  @Column({ type: 'int', nullable: true })
  ownerId: number

  @Field(() => String)
  @Column({ type: 'varchar', nullable: true })
  content: string

  @Field(() => Int)
  @Column({ type: 'varchar', nullable: true })
  upvotes: number

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  postedAt: Date
}