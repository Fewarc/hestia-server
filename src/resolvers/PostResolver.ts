import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";
import { Like } from "typeorm";
import { BlogPagePosts } from "../models/BlogPagePosts";
import { Post } from "../models/Post";

@Resolver()
export class PostResolver {

  @Mutation(() => Boolean)
  async createPost(
    @Arg('title') title: string,
    @Arg('content') description: string,
    @Arg('userId') userId: number,
    @Arg('tags') tags: string,
    @Arg('postId', type => Int, { nullable: true }) postId: number | null,
    @Arg('replyToId', type => Int, { nullable: true }) replyToId: number | null,
  ) {
    let newPost = Post.create();

    newPost.ownerId = userId;
    newPost.title = title;
    newPost.description = description;
    newPost.tags = tags;
    if (postId) newPost.postId = postId;
    if (replyToId) newPost.replyToId = replyToId;

    await newPost.save();

    return true;
  }

  @Query(() => BlogPagePosts)
  async getBlogPagePosts(
    @Arg('userId') userId: number
  ) {
    const userPosts = (await Post.find({ ownerId: userId, replyToId: null }));
    const allPosts = await Post.find();
    const mostRecent = allPosts.sort((a: Post, b: Post) => b.postedAt.getTime() - a.postedAt.getTime()).slice(0, 5);
    const mostUpvoted = allPosts.sort((a: Post, b: Post) => b.upvotes - a.upvotes).slice(0, 5);

    let blogPosts = new BlogPagePosts(userPosts, mostRecent, mostUpvoted);

    return blogPosts;
  }

  @Query(() => [Post])
  async findPost(
    @Arg('searchValue') searchValue: string
  ) {
    return await Post.find({where: [
      { title: Like(`%${searchValue}%`) },
      { description: Like(`%${searchValue}%`) },
      { tags: Like(`%${searchValue}%`) },
    ]});
  }

  @Query(() => Post)
  async getPost(
    @Arg('postId') postId: number
  ) {
    let post = await Post.findOne({ id: postId});
    post!.comments = await Post.find({ postId: postId });

    return post;
  }
}