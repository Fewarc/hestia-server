import { Field, ID, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { EncryptionTransformer } from "typeorm-encrypted";
import { MyEncryptionTransformerConfig } from "../utils/encryptionUtils";

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
  @Column({
    type: 'varchar',
    nullable: true,
    transformer: new EncryptionTransformer(MyEncryptionTransformerConfig)
  })
  content: string

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  sentAt: Date
}
