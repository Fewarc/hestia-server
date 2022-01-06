import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class AgencyStats {

  constructor(
    totalClients: number, 
    saleLevels: number[], 
    totalAgents: number, 
    messagesSentByAgents: number, 
    agentsMeetings: number, 
    agencyOffers: number,
    offerCategories: number[]
  ) {
    this.totalClients = totalClients;
    this.saleLevels = saleLevels;
    this.totalAgents = totalAgents;
    this.messagesSentByAgents = messagesSentByAgents;
    this.agentsMeetings = agentsMeetings;
    this.agencyOffers = agencyOffers;
    this.offerCategories = offerCategories;
  }

  @Field(() => Int)
  totalClients: number;

  @Field(() => [Int])
  saleLevels: number[];

  @Field(() => [Int])
  offerCategories: number[];

  @Field(() => Int)
  totalAgents: number;

  @Field(() => Int)
  messagesSentByAgents: number;

  @Field(() => Int)
  agentsMeetings: number;

  @Field(() => Int)
  agencyOffers: number;
}