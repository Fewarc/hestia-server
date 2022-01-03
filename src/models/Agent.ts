import { Field, Int, ObjectType } from "type-graphql";
import { User } from "./User";

@ObjectType()
export class Agent {

  constructor(agent: User, saleLevel: number[], totalClients: number) {
    this.agent = agent;
    this.saleLevels = saleLevel;
    this.totalClients = totalClients;
  }

  @Field(() => User)
  agent: User

  @Field(() => [Int])
  saleLevels: number[]
  
  @Field(() => Int)
  totalClients: number
}