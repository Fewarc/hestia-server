import { FileUpload, GraphQLUpload, graphqlUploadExpress, Upload } from "graphql-upload";
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
    @Arg('floor', { nullable: true }) floor: number,
    @Arg('numberOfRooms', { nullable: true }) numberOfRooms: number,
    @Arg('price') price: number,
    @Arg('currency') currency: string,
    @Arg('negotiable') negotiable: boolean,
    @Arg('address') address: string,
    @Arg('lat') lat: number,
    @Arg('lng') lng: number,
    @Arg('files', () => GraphQLUpload, { nullable: true }) files: Upload
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
    newOffer.lat = lat;
    newOffer.lng = lng;

    const offer = await newOffer.save();

    console.log(newOffer);
    console.log(files);

    return newOffer;
  }
}