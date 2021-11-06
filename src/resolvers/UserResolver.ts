import { ApolloError } from "apollo-server-errors";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { UserRole } from "../enums/UserRole";
import { User } from "../models/User";

@Resolver()
export class UserResolver {
  @Query(() => [User])
  private getUsers() {
    return User.find();
  }

  @Query(() => User)
  async logInUser(
    @Arg('login') login: string,
    @Arg('password') password: string
  ) {
    const users = await User.find();

    if(!users.some(user => user.login === login)) throw new ApolloError('user does not exist', 'USER_DOESNT_EXIST');

    const user = await users.find(u => u.login === login);

    if(user?.password !== password) throw new ApolloError('wrong password', 'WRONG_PASSWORD');

    return user;
  }

  @Mutation(() => Boolean)
  async insertUser(
    @Arg('login') login: string, 
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Arg('role') role: UserRole
  ) {
    let newUser = User.create();
    
    const users = await User.find();

    if(users.some(user => user.login === login)) throw new ApolloError('a user with that username already exists', 'USERNAME_EXISTS');
    if(users.some(user => user.email === email)) throw new ApolloError('an account with that email already exists', 'EMAIL_EXISTS');

    newUser.login = login;
    newUser.email = email;
    newUser.password = password; // TODO: hash the password !
    newUser.role = role;

    await newUser.save();
    return true;
  }
}