import { Arg, Mutation, Resolver } from "type-graphql";
import { Ofert } from "../models/Ofert";

@Resolver()
export class OfertResolver {
  @Mutation(() => Ofert)
  async createOfert(
    
  ) {

  }
}