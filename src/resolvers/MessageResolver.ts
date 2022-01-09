import { PubSubEngine } from "graphql-subscriptions";
import { Arg, Mutation, Resolver, PubSub, Subscription, Root, Query } from "type-graphql";
import Config from "../constants/Config";
import { NotificationType } from "../enums/NotificationType";
import { Message } from "../models/Message";
import { Notification } from "../models/Notification";

@Resolver()
export class MessageResolver {
  @Subscription(() => [Message], {
    topics: Config.MESSAGE_SENT
  })
  messageSent(
    @Root() messagePayload: Message[],
    @Arg('firstUser') firstUser: number,
    @Arg('secondUser') secondUser: number,
  ) {
    return messagePayload.filter(message => (
      message.toId === firstUser && message.fromId === secondUser ||
      message.toId === secondUser && message.fromId === firstUser
    )).sort((a: Message, b: Message) => ((a.sentAt < b.sentAt) ? -1 : ((a.sentAt > b.sentAt) ? 1 : 0))).reverse();
  }

  @Mutation(() => Boolean)
  async sendMessage(
    @Arg('fromId') fromId: number,
    @Arg('toId') toId: number,
    @Arg('content') content: string,
    @PubSub() pubSub: PubSubEngine
  ) {
    let newMessage = Message.create();

    newMessage.fromId = fromId;
    newMessage.toId = toId;
    newMessage.content = content;

    const notificationExists = await Notification.find({ senderId: fromId, targetId: toId, content: Config.NEW_MESSAGE });

    if (!notificationExists.length) {
      let messageNotification = Notification.create();

      messageNotification.senderId = fromId;
      messageNotification.targetId = toId;
      messageNotification.content = Config.NEW_MESSAGE;
      messageNotification.type = NotificationType.MESSAGE;

      await messageNotification.save();

      const allNotifications = await Notification.find();

      await pubSub.publish(Config.NOTIFICATION_ADDED, allNotifications);
    }

    await newMessage.save();

    const allMessages = await Message.find(); 

    await pubSub.publish(Config.MESSAGE_SENT, allMessages);

    return true;
  }

  @Query(() => [Message])
  async getMessages(
    @Arg('firstUser') firstUser: number,
    @Arg('secondUser') secondUser: number,
  ) {
    const messages = await Message.find({ where: [
      { fromId: firstUser, toId: secondUser },
      { fromId: secondUser, toId: firstUser }
    ] });

    return messages.sort((a: Message, b: Message) => ((a.sentAt < b.sentAt) ? -1 : ((a.sentAt > b.sentAt) ? 1 : 0))).reverse();
  }
}