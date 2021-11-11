import { subscribe } from "graphql";
import { PubSubEngine } from "graphql-subscriptions";
import { Arg, Mutation, PubSub, Resolver, Root, Subscription } from "type-graphql";
import { NotificationType } from "../enums/NotificationType";
import { Notification } from "../models/Notification";

const NOTIFICATION_ADDED: string = 'notificationAdded';

@Resolver()
export class NotificationResolver {
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

    await pubSub.publish(NOTIFICATION_ADDED, newNotification);

    return newNotification;
  }

  @Subscription({
    topics: NOTIFICATION_ADDED
  })
  newNotification(@Root() notificationPayload: Notification): Notification {
    return notificationPayload;
  }
}