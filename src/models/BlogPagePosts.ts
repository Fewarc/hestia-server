import { Field, ObjectType } from "type-graphql";
import { Post } from "./Post";

@ObjectType()
export class BlogPagePosts {

  constructor(userPosts: Post[], mostRecentPosts: Post[], mostUpvotedPosts: Post[]) {
    this.userPosts = userPosts;
    this.mostRecent = mostRecentPosts;
    this.mostUpvoted = mostUpvotedPosts;
  } 

  @Field(() => [Post])
  userPosts: Post[]

  @Field(() => [Post])
  mostRecent: Post[]

  @Field(() => [Post])
  mostUpvoted: Post[]
}