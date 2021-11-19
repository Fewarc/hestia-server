import { Storage } from "@google-cloud/storage";
import { FileUpload, GraphQLUpload } from "graphql-upload";
import { Arg, Mutation, Resolver } from "type-graphql";

const storage = new Storage({ keyFilename: process.env.GOOGLE_STORAGE_API_KEY_PATH as string })

const bucketName = 'hestia-photos';

@Resolver()
export class PhotoResolver {

  @Mutation(() => Boolean)
  async singleUpload(
    @Arg('file', () => GraphQLUpload)
    { createReadStream, filename }: FileUpload
  ) {
    let success: boolean = false;

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
              console.log(e[0].object);
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



}