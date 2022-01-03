import { Field, Int, ObjectType } from "type-graphql";
import { User } from "./User";

@ObjectType()
export class Agent {

  @Field(() => User)
  agent: User

  @Field(() => [Int])
  saleLevels: number[]
  
  @Field(() => Int)
  totalCLients: number
}