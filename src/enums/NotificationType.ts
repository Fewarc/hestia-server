import { registerEnumType } from "type-graphql";

export enum NotificationType {
  NOTIFICATION = 'notification',
  MESSAGE = 'message',
  EVENT = 'event'
}

registerEnumType(NotificationType, {
  name: 'NotificationType'
});
