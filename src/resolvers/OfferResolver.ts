import { FileUpload, GraphQLUpload, graphqlUploadExpress } from "graphql-upload";
import { Arg, Mutation, Resolver } from "type-graphql";
import { OfferCategory } from "../enums/OfferCategory";
import { OfferType } from "../enums/OfferType";
import { Offer } from "../models/Offers";

@Resolver()
export class OfferResolver {
  @Mutation(() => Offer)
  async createNewOffert(
    @Arg('title') title: string,
    @Arg('description') description: string,
    @Arg('offerType') offerType: OfferType,
    @Arg('category') category: OfferCategory,
    @Arg('furnished') furnished: boolean,
    @Arg('area') area: number,
    @Arg('floor') floor: number | null,
    @Arg('numberOfRooms') numberOfRooms: number | null,
    @Arg('price') price: number,
    @Arg('currency') currency: string,
    @Arg('negotiable') negotiable: boolean,
    @Arg('address') address: string,
    @Arg('coordinates') coordinates: { lat: number, lng: number },
    @Arg('files', () => GraphQLUpload) files: FileUpload
  ) {
    let newOffer = Offer.create();

    newOffer.title = title;
    newOffer.description = description;
    newOffer.offerType = offerType;
    newOffer.category = category;
    newOffer.furnished = furnished;
    newOffer.area = area;
    newOffer.floor = floor;
    newOffer.numberOfRooms = numberOfRooms;
    newOffer.price = price;
    newOffer.currency = currency;
    newOffer.negotiable = negotiable;
    newOffer.address = address;
    newOffer.lat = coordinates.lat;
    newOffer.lng = coordinates.lng;

    const offer = await newOffer.save();

    console.log(files);

  }
}