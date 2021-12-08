import { PubSubEngine } from "graphql-subscriptions";
import { Arg, Mutation, Resolver, PubSub, Subscription, Root, Query } from "type-graphql";
import Config from "../constants/Config";
import { Message } from "../models/Message";

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
    )).sort((a: Message, b: Message) => ((a.sentAt < b.sentAt) ? -1 : ((a.sentAt > b.sentAt) ? 1 : 0)));
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

    return messages.sort((a: Message, b: Message) => ((a.sentAt < b.sentAt) ? -1 : ((a.sentAt > b.sentAt) ? 1 : 0)));
  }
}