import { ApolloError } from "apollo-server-errors";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { UserRole } from "../enums/UserRole";
import { User } from "../models/User";
import jwt, { Secret } from "jsonwebtoken"
import { Like } from "typeorm";

@Resolver()
export class UserResolver {
  @Query(() => [User])
  private getUsers() {
    return User.find();
  }

  @Query(() => String)
  async logInUser(
    @Arg('login') login: string,
    @Arg('password') password: string
  ) {
    const users = await User.find();

    if(!users.some(user => user.login === login)) throw new ApolloError('user does not exist', 'USER_DOESNT_EXIST');

    const user = users.find(user => user.login === login);

    if(user?.password !== password) throw new ApolloError('wrong password', 'WRONG_PASSWORD');

    return jwt.sign(
      {user},
      process.env.JWT_SECRET as Secret,
      {
        algorithm: 'HS256',
        subject: user.id.toString(),
        expiresIn: process.env.JWT_DURATION
      }
    );
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

  @Query(() => [User])
  async findUsers(
    @Arg('searchValue') searchValue: string,
    @Arg('userId') userId: number
  ) {
    const resultByLogin = await User.find({where: { login: Like(`%${searchValue}%`) }});
    const resultByFirstName = await User.find({where: { firstName: Like(`%${searchValue}%`) }});
    const resultByLastName = await User.find({where: { lastName: Like(`%${searchValue}%`) }});

    return [ ...resultByLogin, ...resultByFirstName, ...resultByLastName ].filter(user => user.id !== userId);
  }
}