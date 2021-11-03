import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../models/User";

@Resolver()
export class UserResolver {
  @Query(() => [User])
  getUsers() {
    return User.find();
  }

  @Mutation(() => User)
  async insertUser(@Arg("login") login: string) {
    let newUser = User.create();
    
    

    await newUser.save();
    return newUser;
  }
}