import { registerEnumType } from "type-graphql";

export enum UserRole {
  USER = 'user',
  AGENT = 'agent',
  AGENCY = 'agency'
}

registerEnumType(UserRole, {
  name: 'UserRole'
});