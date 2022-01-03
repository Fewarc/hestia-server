import { Field, ID, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EncryptionTransformer } from "typeorm-encrypted";
import { MyEncryptionTransformerConfig } from "../utils/encryptionUtils";

@Entity()
@ObjectType()
export class Note extends BaseEntity {
  
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number

  @Field(() => Int)
  @Column({ type: 'int', nullable: true })
  eventId: number

  @Field(() => Int)
  @Column({ type: 'int', nullable: true })
  ownerId: number

  @Field(() => String)
  @Column({
    type: 'varchar',
    nullable: true,
    transformer: new EncryptionTransformer(MyEncryptionTransformerConfig)
  })
  content: string

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}