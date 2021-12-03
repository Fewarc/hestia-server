import { ApolloError } from "apollo-server-express";
import { Arg, Field, Mutation, PubSub, PubSubEngine, Query, Resolver } from "type-graphql";
import Config from "../constants/Config";
import { NotificationType } from "../enums/NotificationType";
import { Contact } from "../models/Contact";
import { Notification } from "../models/Notification";
import { User } from "../models/User";

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

    if (possibleConection) throw new ApolloError('This user already is your contact, please refresh page', 'ALREADY_CONTACT');

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

    const userContacts = await User.find({where: [
      ...normalizedIds
    ]});

    return userContacts;
  }
}