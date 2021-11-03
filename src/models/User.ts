import { Field, ID, Int, ObjectType, registerEnumType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserRole } from "../enums/UserRole";

registerEnumType(UserRole, {
  name: 'UserRole'
});

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
  @Column('varchar', { length: 20, nullable: true })
  password: string // TODO: hashed

  @Field(() => UserRole)
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole

  @Field(() => String, { nullable: true })
  @Column('varchar', { length: 20, nullable: true })
  firstName: string

  @Field(() => String, { nullable: true })
  @Column('varchar', { length: 20, nullable: true })
  lastName: string

  @Field(() => String, { nullable: true })
  @Column('varchar', { length: 100, nullable: true }) // TODO: check coordinates length
  coordinates: string
  
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

  // @Field()
  // @Column()
  // profilePicture: 
}