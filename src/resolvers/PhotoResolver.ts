import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { Photo } from "../models/Photo";

@Resolver()
export class PhotoResolver {
  @Query(() => String)
  hello() {
    return "world";
  }

  @Query(() => [Photo])
  photos() {
    return Photo.find();
  }

  @Mutation(() => Photo)
  async insertPhoto(@Arg("name") name: string) {
    let photo = Photo.create();
    photo.name = name;
    await photo.save();
    return photo;
  }
}