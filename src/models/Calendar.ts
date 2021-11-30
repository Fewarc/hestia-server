import { Field, Int, ObjectType } from "type-graphql";
import { Event } from "../models/Event";

@ObjectType()
export class Calendar {
  @Field(() => [[Int]])
  calendar: number[][]

  @Field(() => [Event])
  events: Event[]
}