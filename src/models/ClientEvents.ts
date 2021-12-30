import { Field, ObjectType } from "type-graphql";
import { Event } from "../models/Event";

@ObjectType()
export class ClientEvents {

  constructor(pastEvents: Event[], futureEvents: Event[]) {
    this.pastEvents = pastEvents;
    this.futureEvents = futureEvents;
  }

  @Field(() => [Event])
  pastEvents: Event[]

  @Field(() => [Event])
  futureEvents: Event[]

}