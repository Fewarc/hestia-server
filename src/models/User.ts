import { Field, ID, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserRole } from "../enums/UserRole";

@Entity()
@ObjectType()
export class User extends BaseEntity {

  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number

  @Field(() => String)
  @Column('varchar', { length: 20, nullable: true })
  login: string

  @Field(() => String)
  @Column('varchar', { length: 20, nullable: true })
  password: string // TODO: hashed

  @Field()
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole

  @Field(() => String)
  @Column('varchar', { length: 20, nullable: true })
  firstName: string

  @Field(() => String)
  @Column('varchar', { length: 20, nullable: true })
  lastName: string

  @Field(() => String)
  @Column('varchar', { length: 100, nullable: true }) // TODO: check coordinates length
  coordinates: string
  
  @Field(() => Int)
  @Column({ type: 'int', nullable: true })
  age: number

  @Field(() => String)
  @Column('varchar', { length: 3, nullable: true })
  countryCode: string

  @Field(() => Int)
  @Column({ type: 'int', nullable: true, default: null })
  rating: number

  @Field(() => ID)
  @Column({ type: 'int', nullable: true })
  agencyId: number

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

  // @Field()
  // @Column()
  // profilePicture: 
}