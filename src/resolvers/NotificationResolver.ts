import { ApolloError } from "apollo-server-express";
import { subscribe } from "graphql";
import { PubSubEngine } from "graphql-subscriptions";
import { Arg, Mutation, PubSub, Query, registerEnumType, Resolver, Root, Subscription } from "type-graphql";
import { Like } from "typeorm";
import Config from "../constants/Config";
import { NotificationType } from "../enums/NotificationType";
import { Contact } from "../models/Contact";
import { Notification } from "../models/Notification";
import { User } from "../models/User";

@Resolver()
export class NotificationResolver {
  @Query(() => [Notification])
  async getUserNotifications(
    @Arg('userId') userId: number
  ) {
    const userNotifications: Notification[] = await Notification.find({ targetId: userId });

    return userNotifications;
  }
  
  @Mutation(() => Notification)
  async createNotification(
    @Arg('type') type: NotificationType,
    @Arg('content') content: string,
    @Arg('targetId') targetId: number,
    @Arg('senderId') senderId: number,
    @PubSub() pubSub: PubSubEngine
  ) {
    let newNotification: Notification = Notification.create();

    newNotification.type = type;
    newNotification.content = content;
    newNotification.targetId = targetId;
    newNotification.senderId = senderId;

    await newNotification.save();

    const allNotifications = await Notification.find();

    await pubSub.publish(Config.NOTIFICATION_ADDED, allNotifications);

    return newNotification;
  }

  @Mutation(() => [Notification])
  async deleteNotification(
    @Arg('id') id: number,
    @Arg('content') content: string,
    @Arg('userId') userId: number,
    @PubSub() pubSub: PubSubEngine
  ) {
    try {
      await Notification.delete({ id, content });
    } catch (error) {
      throw new ApolloError('Something went wrong while processing the notification', 'NOTIFICATION_DELETE_ERROR');
      return false;
    } finally {
      const allNotifications = await Notification.find();

      await pubSub.publish(Config.NOTIFICATION_ADDED, allNotifications);

      return await Notification.find({ targetId: userId });
    }
  }

  @Mutation(() => [Notification])
  async deleteAllNotifications(
    @Arg('targetId') targetId: number, 
    @Arg('type') type: NotificationType
  ) {
    try {
      await Notification.delete({ targetId, type });
    } catch (error) {
      throw new ApolloError('Something went wrong while processing the notification', 'NOTIFICATION_DELETE_ERROR');
      return false;
    } finally {
      return await Notification.find({ targetId: targetId });
    }
  }

  @Subscription(() => [Notification], {
    topics: Config.NOTIFICATION_ADDED
  })
  newNotification(
    @Root() notificationPayload: Notification[],
    @Arg('userId') userId: number
  ) {
    return notificationPayload.filter(notification => notification.targetId === userId);
  }

  @Mutation(() => [Notification])
  async acceptInvite(
    @Arg('id') id: number,
    @Arg('content') content: string,
    @Arg('userId') userId: number,
    @Arg('targetId') targetId: number,
    @PubSub() pubSub: PubSubEngine
  ) {
    let newContact = Contact.create();

    const possibleConection = await Contact.find({where: [
      { userId: userId, contactId: targetId },
      { userId: targetId, contactId: userId },
    ]})

    if (!!possibleConection.length) throw new ApolloError('This user already is your contact, please refresh page', 'ALREADY_CONTACT');

    newContact.userId = userId;
    newContact.contactId = targetId;

    await newContact.save();

    let newNotification: Notification = Notification.create();

    const sender: User | undefined = await User.findOne({ id: targetId });

    newNotification.targetId = userId;
    newNotification.senderId = targetId;
    newNotification.content = `User @${sender?.login} has accepted your invite!`;
    newNotification.type = NotificationType.NOTIFICATION;

    await newNotification.save();

    const allNotifications = await Notification.find();

    await pubSub.publish(Config.NOTIFICATION_ADDED, allNotifications);

    try {
      await Notification.delete({ id, content });
    } catch (error) {
      throw new ApolloError('Something went wrong while processing the notification', 'NOTIFICATION_DELETE_ERROR');
      return false;
    } finally {
      return await Notification.find({ targetId: targetId });
    }
  }

  @Query(() => [Notification])
  async getPendingInvites(
    @Arg('userId') userId: number
  ) {
    return await Notification.find({ where: [
      { senderId: userId },
      { content: Like(`%${Config.CONTACTS_PREFIX}%`) }
    ] });
  }

  @Query(() => [Notification])
  async getPendingEventInvites(
    @Arg('eventId') eventId: number
  ) {
    return await Notification.find({ where: [
      { senderId: eventId },
      { content: Like(`%${Config.EVENT_PREFIX}%`) }
    ] });
  }

  @Mutation(() => Boolean)
  async inviteUsersForEvent(
    @Arg('userIds', type => [Number]) userIds: number[],
    @Arg('eventId') eventId: number,
    @Arg('content') content: string
  ) {
    await userIds.forEach(async (id: number) => {
      let newNotification = Notification.create()

      newNotification.type = NotificationType.INVITE;
      newNotification.content = content;
      newNotification.senderId = eventId;
      newNotification.targetId = id;

      await newNotification.save();
    });

    return true;
  }
}