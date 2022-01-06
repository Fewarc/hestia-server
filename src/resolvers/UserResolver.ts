import { ApolloError } from "apollo-server-errors";
import { Arg, emitSchemaDefinitionFile, Mutation, Query, Resolver } from "type-graphql";
import { UserRole } from "../enums/UserRole";
import { User } from "../models/User";
import jwt, { Secret } from "jsonwebtoken"
import { Like } from "typeorm";
import { Contact } from "../models/Contact";
import Config from "../constants/Config";
import { Agent } from "../models/Agent";
import { Client } from "../models/Client";
import { AgencyStats } from "../models/AgencyStats";
import { Message } from "../models/Message";
import { EventParticipants } from "../models/EventParticipants";
import { Offer } from "../models/Offers";
import { OfferCategory } from "../enums/OfferCategory";

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

    let user = users.find(user => user.login === login);

    if(user?.password !== password) throw new ApolloError('wrong password', 'WRONG_PASSWORD');

    user.lastLogIn = new Date();

    await user.save();

    delete user.password;

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
    newUser.password = password;
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

    const userContacts: Contact[] = await Contact.find({where: [
      { userId: userId },
      { contactId: userId }
    ]});

    return [ ...resultByLogin, ...resultByFirstName, ...resultByLastName ].filter(user => 
      user.id !== userId).filter(user => !userContacts.some(userContact => {
        if (userContact.userId === userId) {
          return user.id === userContact.contactId;
        } else {
          return user.id === userContact.userId;
        }
      })
    );
  }

  @Mutation(() => String)
  async updateUserData(
    @Arg('userId') userId: number,
    @Arg('firstName') firstName: string,
    @Arg('lastName', { nullable: true }) lastName: string,
    @Arg('email') email: string,
    @Arg('age', { nullable: true }) age: number,
    @Arg('address') address: string,
    @Arg('lat') lat: number,
    @Arg('lng') lng: number,
  ) {
    let user = await User.findOne({ id: userId });

    user!.firstName = firstName;
    user!.lastName = lastName;
    user!.email = email;
    user!.age = age;
    user!.address = address;
    user!.lat = lat;
    user!.lng = lng;

    await user?.save();

    return jwt.sign(
      {user},
      process.env.JWT_SECRET as Secret,
      {
        algorithm: 'HS256',
        subject: user!.id.toString(),
        expiresIn: process.env.JWT_DURATION
      }
    );
  }

  @Query(() => [User])
  async getAgencies(
    @Arg('searchPhrase') searchPhrase: string
  ) {
    const agencies = User.find({where: [
      { 
        role: UserRole.AGENCY,
        firstName: Like(`%${searchPhrase}%`)
      },
      { 
        role: UserRole.AGENCY,
        address: Like(`%${searchPhrase}%`)
      }
    ]});

    return (await agencies).filter(agency => !!agency.address);
  }

  @Query(() => User)
  async getAgencyDetails(
    @Arg('agencyId') agencyId: number
  ) {
    const agency = await User.findOne({ id: agencyId });

    return agency;
  }

  @Query(() => [User])
  async findAgents(
    @Arg('searchPhrase') searchPhrase: string
  ) {
    const agents = await User.find({where: [
      {
        role: UserRole.AGENT,
        login: Like(`%${searchPhrase}%`)
      },
      {
        role: UserRole.AGENT,
        firstName: Like(`%${searchPhrase}%`)
      },
      {
        role: UserRole.AGENT,
        lastName: Like(`%${searchPhrase}%`)
      },
    ]});

    return agents;
  }

  @Query(() => [Agent])
  async getAgnecyAgents(
    @Arg('agencyId') agencyId: number
  ) {
    let agents = await User.find({ agencyId });
    let retAgents = await Promise.all(agents.map(async (agent: User) => {

    let saleLevels: number[] = new Array(6).fill(0);

    const clients = await Client.find({ agentId: agent.id });

    clients.forEach((client: Client) => {
      saleLevels[client.saleLevel]++;
    });

      return new Agent(agent, saleLevels, clients.length);
    }));
    
    return retAgents;
  }

  @Query(() => AgencyStats)
  async getAgencyStats(
    @Arg('agencyId') agencyId: number 
  ) {
    const agentsIds = await (await User.find({ role: UserRole.AGENT, agencyId: agencyId }));

    const clients = await Client.find({where: [
       ...agentsIds.map((agent: User) => ({ agentId: agent.id })) 
    ]});

    let sales: number[] = new Array(6).fill(0);

    clients.forEach((client: Client) => {
      sales[client.saleLevel]++;
    });
    
    const messages: number = (await Message.find({where: [
      ...agentsIds.map((agent: User) => ({ fromId: agent.id })) 
    ]})).length;

    const meetings: number = (await EventParticipants.find({where: [
      ...agentsIds.map((agent: User) => ({ participantId: agent.id })) 
    ]})).length;

    const offers: number = (await Offer.find({agencyId: agencyId})).length;

    let offerCategories: number[] = new Array(6).fill(0);
    const agencyOffers = await Offer.find({ agencyId: agencyId });

    agencyOffers.forEach((offer: Offer) => {
      switch (offer.category) {
        case OfferCategory.AGRICULTURAL:
          offerCategories[0]++;
          break;
          
        case OfferCategory.RESIDENTIAL:
          offerCategories[1]++;
          break;

        case OfferCategory.COMMERCIAL:
          offerCategories[2]++;
          break;

        case OfferCategory.INDUSTRIAL:
          offerCategories[3]++;
          break;

        case OfferCategory.RAW_LAND:
          offerCategories[4]++;
          break;

        case OfferCategory.SPECIAL_USE:
          offerCategories[5]++;
          break;

      }
    });

    return new AgencyStats(clients.length, sales, agentsIds.length, messages, meetings, offers, offerCategories);
  }
}