import { Arg, Mutation, Resolver } from "type-graphql";
import { Offer } from "../models/Offers";

@Resolver()
export class OfferResolver {
  @Mutation(() => Offer)
  async createOffert(
    
  ) {

  }
}