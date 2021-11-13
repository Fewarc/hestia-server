import { registerEnumType } from "type-graphql";

export enum OfertCategory {
  AGRICULTURAL= 'agricultural',
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  INDUSTRIAL = 'industrial',
  RAW_LAND = 'raw land',
  SPECIAL_USE = 'special use'
}

registerEnumType(OfertCategory, {
  name: 'OfertCategory'
});
