import { ApolloError } from "apollo-server-express";
import { subscribe } from "graphql";
import { PubSubEngine } from "graphql-subscriptions";
import { Arg, Mutation, PubSub, Query, registerEnumType, Resolver, Root, Subscription } from "type-graphql";
import Config from "../constants/Config";
import { NotificationType } from "../enums/NotificationType";
import { Contact } from "../models/Contact";
import { Notification } from "../models/Notification";

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
    @Arg('userId') userId: number
  ) {
    try {
      await Notification.delete({ id, content });
    } catch (error) {
      throw new ApolloError('Something went wrong while processing the notification', 'BOTIFICATION_DELETE_ERROR');
      return false;
    } finally {
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
      throw new ApolloError('Something went wrong while processing the notification', 'BOTIFICATION_DELETE_ERROR');
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
    @Arg('targetId') targetId: number
  ) {
    let newContact = Contact.create();

    newContact.userId = userId;
    newContact.contactId = targetId;

    await newContact.save();

    try {
      await Notification.delete({ id, content });
    } catch (error) {
      throw new ApolloError('Something went wrong while processing the notification', 'BOTIFICATION_DELETE_ERROR');
      return false;
    } finally {
      return await Notification.find({ targetId: userId });
    }
  }
}