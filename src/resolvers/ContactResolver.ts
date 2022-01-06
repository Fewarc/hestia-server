import { ApolloError } from "apollo-server-express";
import { Arg, Int, Mutation, PubSub, PubSubEngine, Query, Resolver } from "type-graphql";
import { Like } from "typeorm";
import Config from "../constants/Config";
import { NotificationType } from "../enums/NotificationType";
import { Client } from "../models/Client";
import { ClientEvents } from "../models/ClientEvents";
import { Contact } from "../models/Contact";
import { EventParticipants } from "../models/EventParticipants";
import { Notification } from "../models/Notification";
import { User } from "../models/User";
import { uniqBy } from "../utils/arrayUtils";
import { Event } from "../models/Event";

@Resolver()
export class ContactResolver {
  @Mutation(() => Boolean)
  async sendContactInvite(
    @Arg('senderId') senderId: number,
    @Arg('targetId') targetId: number,
    @Arg('inviteContent') inviteContent: string,
    @PubSub() pubSub: PubSubEngine
  ) {
    let newNotification = Notification.create();

    if (targetId === senderId) throw new ApolloError(`You can't send an invite to yourself`, 'INVITATION_SAME_USER_ERROR');

    const possibleConection = await Contact.find({where: [
      { userId: senderId, contactId: targetId },
      { userId: targetId, contactId: senderId },
    ]})

    if (!!possibleConection.length) throw new ApolloError('This user already is your contact, please refresh page', 'ALREADY_CONTACT');

    newNotification.targetId = targetId;
    newNotification.senderId = senderId;
    newNotification.content = inviteContent;
    newNotification.type = NotificationType.INVITE;

    await newNotification.save();

    const allNotifications = await Notification.find();

    await pubSub.publish(Config.NOTIFICATION_ADDED, allNotifications);

    return true;
  }

  @Query(() => [User])
  async getContacts(
    @Arg('userId') userId: number
  ) {
    const userContactsByUser = await Contact.find({ userId: userId });
    const userContactsByContact = await Contact.find({ contactId: userId });

    const uniqueContacts = [ 
      ...userContactsByUser, 
      ...userContactsByContact.filter(contact => 
        !userContactsByUser.some(contactByUser => 
          contact.userId === contactByUser.contactId && contact.contactId === contactByUser.userId)) 
    ];

    const normalizedIds = uniqueContacts.map(contact => {
      if (contact.userId === userId) {
        return { id: contact.contactId }
      } else {
        return {
          id: contact.userId,
        }
      }
    });

    if (!uniqueContacts.length && !normalizedIds.length) return [];

    const userContacts = await User.find({where: [
      ...normalizedIds
    ]});

    return userContacts;
  }

  @Mutation(() => User)
  async removeContact(
    @Arg('userId') userId: number,
    @Arg('contactId') contactId: number
  ) {
    const contact: Contact | undefined = await Contact.findOne({where: [
      { userId: userId, contactId: contactId },
      { userId: contactId, contactId: userId }
    ]});

    if (!contact) throw new ApolloError('This user is no longer your contact', 'NO_LONGER_CONTACT')

    const removedContactUser: User | undefined = await User.findOne({id: contact.userId === userId ? contactId : userId });

    try {
      await Contact.delete({ userId: contact.userId, contactId: contact.contactId });
    } catch (error) {
      throw new ApolloError('Something went wrong while processing removal request', 'CONTAC_REMOVAL_ERROR');
      return false;
    } finally {
      return removedContactUser;
    }
  }

  @Query(() => [User])
  async findUserContacts(
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

    const users = uniqBy([ ...resultByLogin, ...resultByFirstName, ...resultByLastName ], JSON.stringify);

    return users.filter((user: User) => 
      user.id !== userId).filter((user: User) => userContacts.some(userContact => {
        if (userContact.userId === userId) {
          return user.id === userContact.contactId;
        } else {
          return user.id === userContact.userId;
        }
      })
    );
  }

  @Mutation(() => Boolean)
  async addAsClient(
    @Arg('agentId') agentId: number,
    @Arg('clientId') clientId: number,
  ) {
    let newClient = Client.create();

    newClient.agentId = agentId;
    newClient.clientId = clientId;

    await newClient.save();

    return true;
  }

  @Mutation(() => Boolean)
  async removeClient(
    @Arg('agentId') agentId: number,
    @Arg('clientId') clientId: number,
  ) {
    const client = await Client.findOne({ agentId: agentId, clientId: clientId });

    if (!client) throw new ApolloError("Couldn't find contact", 'NO_CONTACT_FOUND');

    try {
      await Client.delete({ agentId: agentId, clientId: clientId });
    } catch (error) {
      throw new ApolloError('Something went wrong while processing removal request', 'CONTAC_REMOVAL_ERROR');
      return false;
    } finally {
      return true;
    }
  }

  @Query(() => [User])
  async getUserClients(
    @Arg('agentId') agentId: number
  ) {
    const clients = await (await Client.find({ agentId: agentId })).map(client => ({ id: client.clientId }));

    if (!clients.length) return [];

    return await User.find({where: [
      ...clients
    ]})
  }

  @Query(() => Int)
  async getSaleLevel(
    @Arg('clientId') clientId: number
  ) {
    const client = await Client.findOne({ clientId: clientId });

    return client!.saleLevel;
  }

  @Mutation(() => Boolean)
  async updateSaleLevel(
    @Arg('agentId') agentId: number,
    @Arg('clientId') clientId: number,
    @Arg('saleLevel') saleLevel: number
  ) {
    let client = await Client.findOne({ agentId: agentId, clientId: clientId });

    client!.saleLevel = saleLevel;

    await client?.save();

    return true;
  }

  @Query(() => ClientEvents)
  async getClientEvents(
    @Arg('agentId') agentId: number,
    @Arg('clientId') clientId: number,
  ) {
    const clientParticipations = await (await EventParticipants.find({ participantId: clientId })).map(participation => ({ id: participation.eventId }));

    if (!clientParticipations.length) return new ClientEvents([], []); 

    const clientEvents = await Event.find({ where: [
      ...clientParticipations
    ] }); 

    const agentParticipations = await (await EventParticipants.find({ participantId: agentId })).map(participation => ({ id: participation.eventId }));
    const agentEvents = await Event.find({ where: [
      ...agentParticipations
    ] }); 

    const sharedEvents = clientEvents.filter(event => agentEvents.some(agentEvent => agentEvent.id === event.id));

    const today = new Date();

    const pastEvents = sharedEvents.filter(event => event.eventOccuranceDate < today);
    const futureEvents = sharedEvents.filter(event => event.eventOccuranceDate > today);
    
    return new ClientEvents(pastEvents, futureEvents);
  }
}