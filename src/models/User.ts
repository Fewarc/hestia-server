import { Field, Float, ID, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EncryptionTransformer } from "typeorm-encrypted";
import { UserRole } from "../enums/UserRole";
import { MyEncryptionTransformerConfig } from "../utils/encryptionUtils";
import { Notification } from "./Notification";

@Entity()
@ObjectType()
export class User extends BaseEntity {

  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number

  @Field(() => String, { nullable: true })
  @Column('varchar', { length: 20, nullable: true })
  login: string | null

  @Field(() => String, { nullable: true })
  @Column('varchar', { length: 30, nullable: true })
  email: string

  @Column({
    type: 'varchar',
    nullable: true,
    transformer: new EncryptionTransformer(MyEncryptionTransformerConfig)
  })
  password: string | undefined

  @Field(() => UserRole)
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole

  @Field(() => String, { nullable: true })
  @Column('varchar', { length: 100, nullable: true })
  firstName: string

  @Field(() => String, { nullable: true })
  @Column('varchar', { length: 20, nullable: true })
  lastName: string

  @Field(() => String, { nullable: true })
  @Column('varchar', { length: 100, nullable: true })
  address: string
  
  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true, default: null})
  lat: number
  
  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true, default: null})
  lng: number

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  age: number

  @Field(() => String, { nullable: true })
  @Column('varchar', { length: 3, nullable: true })
  countryCode: string

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true, default: null })
  rating: number

  @Field(() => ID, { nullable: true })
  @Column({ type: 'int', nullable: true })
  agencyId: number

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

  @Field(() => Date)
  @Column({ type: 'timestamptz', nullable: true, default: new Date() })
  lastLogIn: Date

  @OneToMany(() => Notification, notification => notification.targetId)
  notification: Notification[]
}