import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { BlogPagePosts } from "../models/BlogPagePosts";
import { Post } from "../models/Post";

@Resolver()
export class PostResolver {

  @Mutation(() => Boolean)
  async createPost(
    @Arg('title') title: string,
    @Arg('content') description: string,
    @Arg('userId') userId: number,
    @Arg('tags') tags: string
  ) {
    let newPost = Post.create();

    newPost.replyToId = null;
    newPost.ownerId = userId;
    newPost.title = title;
    newPost.description = description;
    newPost.tags = tags;

    await newPost.save();

    return true;
  }

  @Query(() => BlogPagePosts)
  async getBlogPagePosts(
    @Arg('userId') userId: number
  ) {
    const userPosts = (await Post.find({ ownerId: userId, replyToId: null }));
    const allPosts = await Post.find();
    const mostRecent = allPosts.sort((a: Post, b: Post) => a.postedAt.getTime() - b.postedAt.getTime()).slice(0, 5);
    const mostUpvoted = allPosts.sort((a: Post, b: Post) => a.upvotes - b.upvotes).slice(0, 5);

    let blogPosts = new BlogPagePosts(userPosts, mostRecent, mostUpvoted);

    return blogPosts;
  }
}