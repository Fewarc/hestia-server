import { FileUpload, GraphQLUpload } from "graphql-upload";
import { Storage } from "@google-cloud/storage";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { OfferCategory } from "../enums/OfferCategory";
import { OfferType } from "../enums/OfferType";
import { Offer } from "../models/Offers";
import { Photo } from "../models/Photo";

const storage = new Storage({ keyFilename: process.env.GOOGLE_STORAGE_API_KEY_PATH as string })
const bucketName = process.env.BUCKET_NAME as string;

@Resolver()
export class OfferResolver {
  @Mutation(() => Offer)
  async createNewOffer(
    @Arg('title') title: string,
    @Arg('ownerId') ownerId: number,
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
    @Arg('files', () => [GraphQLUpload], { nullable: true }) files: FileUpload[]
  ) {
    let newOffer = Offer.create();

    newOffer.title = title;
    newOffer.ownerId = ownerId;
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

    await newOffer.save();

    let successUploads: number = 0;
    const totalUploads: number = files.length;
    let index: number = 0;

    for (const file of files) {
      const { createReadStream, filename} = await file;
      // const filename = `${newOffer.id}-${index}`;

      await new Promise(async (resolve, reject) =>
      createReadStream()
        .pipe(
          storage.bucket(bucketName).file(filename).createWriteStream({
            resumable: false,
            gzip: true
          })
        )
        .on('finish', () => 
          storage
            .bucket(bucketName)
            .file(filename)
            .makePublic()
            .then(async e => {
              let newPhoto = Photo.create();

              newPhoto.offerId = newOffer.id;
              newPhoto.imageLink = `https://storage.googleapis.com/${bucketName}/${e[0].object}`;

              await newPhoto.save();
            })
            .then(() => {
              resolve(true);
              successUploads++;
            })
        )
        .on('error', (error) => {
          reject(error);
        })
      );

      index++;
    }

    newOffer.uploads = `${successUploads}/${totalUploads}`;

    await newOffer.save();

    return newOffer;
  }

  @Query(() => [Offer])
  async getOffers(
    
  ) {
    const offers = await Offer.find();

    return offers;
  }

}