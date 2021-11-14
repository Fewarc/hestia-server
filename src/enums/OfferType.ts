import { registerEnumType } from "type-graphql";

export enum OfferType {
  DISPOSAL = 'disposal',
  RENT = 'rent'
}

registerEnumType(OfferType, {
  name: 'OfferType'
});
