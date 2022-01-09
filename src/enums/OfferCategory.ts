import { registerEnumType } from "type-graphql";

export enum OfferCategory {
  AGRICULTURAL= 'agricultural',
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  INDUSTRIAL = 'industrial',
  RAW_LAND = 'raw land',
  SPECIAL_USE = 'special use'
}

registerEnumType(OfferCategory, {
  name: 'OfferCategory'
});