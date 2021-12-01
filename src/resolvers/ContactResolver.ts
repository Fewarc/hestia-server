import { Arg, Field, Mutation, Query, Resolver } from "type-graphql";
import { NotificationType } from "../enums/NotificationType";
import { Notification } from "../models/Notification";

@Resolver()
export class ContactResolver {
  @Mutation(() => Boolean)
  async sendContactInvite(
    @Arg('senderId') senderId: number,
    @Arg('targetId') targetId: number,
    @Arg('inviteContent') inviteContent: string
  ) {
    let newNotification = Notification.create();

    newNotification.targetId = targetId;
    newNotification.senderId = senderId;
    newNotification.content = inviteContent;
    newNotification.type = NotificationType.INVITE;

    await newNotification.save();

    return true;
  }

}