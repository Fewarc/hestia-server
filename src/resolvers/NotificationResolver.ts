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
    const userNotifications: Notification[] = await Notification.find({ userId: userId });

    return userNotifications;
  }
  
  @Mutation(() => Notification)
  async createNotification(
    @Arg('type') type: NotificationType,
    @Arg('content') content: string,
    @Arg('user') userId: number,
    @PubSub() pubSub: PubSubEngine
  ) {
    let newNotification: Notification = Notification.create();

    newNotification.type = type;
    newNotification.content = content;
    newNotification.userId = userId;

    await newNotification.save();

    const allNotifications = await Notification.find();

    await pubSub.publish(NOTIFICATION_ADDED, allNotifications);

    return newNotification;
  }

  @Subscription(() => [Notification], {
    topics: NOTIFICATION_ADDED
  })
  newNotification(
    @Root() notificationPayload: Notification[],
    @Arg('userId') userId: number
  ) {
    return notificationPayload.filter(notification => notification.userId === userId);
  }
}