import { registerEnumType } from "type-graphql";

export enum NotificationType {
  NOTIFICATION = 'notification',
  MESSAGE = 'message',
  EVENT = 'event',
  INVITE = 'invite'
}

registerEnumType(NotificationType, {
  name: 'NotificationType'
});
