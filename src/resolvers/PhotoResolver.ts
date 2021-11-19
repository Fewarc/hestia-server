import { Storage } from "@google-cloud/storage";
import { Resolver } from "type-graphql";

const storage = new Storage({ keyFilename: process.env.GOOGLE_STORAGE_API_KEY_PATH as string })

const bucketName = 'hestia-photos';

@Resolver()
export class PhotoResolver {



}