import { Arg, Mutation, Resolver } from "type-graphql";
import { User } from "../models/User";

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async insertUser(@Arg("login") login: string) {
    let newUser = User.create();
    
    newUser.login = login;

    await newUser.save();
    return newUser;
  }
}