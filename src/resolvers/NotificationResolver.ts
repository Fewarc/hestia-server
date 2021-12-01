import { subscribe } from "graphql";
import { PubSubEngine } from "graphql-subscriptions";
import { Arg, Mutation, PubSub, Query, registerEnumType, Resolver, Root, Subscription } from "type-graphql";
import { NotificationType } from "../enums/NotificationType";
import { Notification } from "../models/Notification";

const NOTIFICATION_ADDED: string = 'notificationAdded';

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

    await pubSub.publish(NOTIFICATION_ADDED, allNotifications);

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
      return false;
    } finally {
      return await Notification.find({ targetId: targetId });
    }
  }

  @Subscription(() => [Notification], {
    topics: NOTIFICATION_ADDED
  })
  newNotification(
    @Root() notificationPayload: Notification[],
    @Arg('userId') userId: number
  ) {
    return notificationPayload.filter(notification => notification.targetId === userId);
  }
}