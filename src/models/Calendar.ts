import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class Calendar {
  @Field(() => Int)
  day: number
}