import { Field, ID, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
@ObjectType()
export class Post extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  replyToId: number | null

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true, default: null })
  postId: number | null
  
  @Field(() => Int)
  @Column({ type: 'int', nullable: true })
  ownerId: number

  @Field(() => String)
  @Column({ type: 'varchar', nullable: true })
  title: string

  @Field(() => String)
  @Column({ type: 'varchar', nullable: true })
  description: string

  @Field(() => Int)
  @Column({ type: 'varchar', nullable: true, default: 0 })
  upvotes: number

  @Field(() => String)
  @Column({ type: 'varchar', nullable: true })
  tags: string

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  postedAt: Date

  @Field(() => [Post])
  comments: Post[]
}