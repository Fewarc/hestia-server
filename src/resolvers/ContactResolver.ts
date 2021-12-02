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
    const userContacts = await Contact.find({ userId: userId });
  }
}