import { Storage } from "@google-cloud/storage";
import { FileUpload, GraphQLUpload } from "graphql-upload";
import { Arg, Mutation, Resolver, Query } from "type-graphql";
import { Photo } from "../models/Photo";

const storage = new Storage({ keyFilename: process.env.GOOGLE_STORAGE_API_KEY_PATH as string })
const bucketName = 'hestia-photos';

@Resolver()
export class PhotoResolver {

  // TESTING MUTATION
  @Mutation(() => Boolean)
  async singleUpload(
    @Arg('file', () => GraphQLUpload)
    file: FileUpload
  ) {
    let success: boolean = false;
    let { createReadStream, filename } = file; 
    console.log('FILE:', file);
    console.log(createReadStream, filename);
    
    filename = `1-${filename}`;

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
            .then(e => {
              console.log(e);
              console.log(`https://storage.googleapis.com/${bucketName}/${e[0].object}`);
            })
            .then(() => {
              resolve(true);
              success = true;
            })
        )
        .on('error', (error) => {
          reject(error);
        })
    );

    return success;
  }

  @Query(() => [Photo])
  async getPhotos(

  ) {
    const photos = await Photo.find();

    return photos;
  }

  @Query(() => [Photo])
  async getThumbnails(

  ) {
    const photos = await Photo.find();

    return photos.filter((photo, index) => photo.offerId !== photos[index - 1]?.offerId);
  }

}