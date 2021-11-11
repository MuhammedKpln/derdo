import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as shuffleArray from 'lodash.shuffle';
import * as uniqBy from 'lodash.uniqby';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dtos/createPost';
import { PostEntity } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsService: Repository<PostEntity>,
    @InjectRepository(User) private readonly usersService: Repository<User>,
  ) {}

  async getAllPosts(user?: User, blogPosts?: boolean): Promise<PostEntity[]> {
    const queryBuilder = this.postsService
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.userLike', 'userLike')
      .leftJoinAndSelect('post.postLike', 'postLike')
      .leftJoinAndSelect('post.user', 'user')
      .loadRelationCountAndMap('post.commentsCount', 'post.comments')
      .limit(10)
      .orderBy('RANDOM()');

    if (blogPosts !== undefined && blogPosts === false) {
      queryBuilder.where('post.type != 4');
    } else if (blogPosts !== undefined && blogPosts === true) {
      console.log('SA');
      queryBuilder.where('post.type = 4');
    }

    const randomPosts = await queryBuilder.getMany();

    if (!user || blogPosts === true) {
      return randomPosts;
    }

    const qb = this.postsService
      .createQueryBuilder('post')
      .innerJoin(
        'follower',
        'follower',
        'post.userId = follower.actorId AND follower.userId = :userId',
        { userId: user.id },
      )
      .leftJoinAndSelect('post.userLike', 'userLike')
      .leftJoinAndSelect('post.postLike', 'postLike')
      .leftJoinAndSelect('post.user', 'user')
      .loadRelationCountAndMap('post.commentsCount', 'post.comments');

    const postsFromUsersFollowing = await qb.getMany();

    if (postsFromUsersFollowing.length < 1) {
      return randomPosts;
    }

    postsFromUsersFollowing.forEach((post) => (post.postFromFollowers = true));

    const uniquePosts = uniqBy(
      [...postsFromUsersFollowing, ...randomPosts],
      (e) => {
        return e.slug;
      },
    );

    const shuffle = shuffleArray(uniquePosts);

    return shuffle;
  }

  async getAllPostsFromUser(username: string) {
    const user = await this.usersService.findOne({
      username,
    });

    const queryBuilder = this.postsService.createQueryBuilder('post');
    queryBuilder.where('post.userId = :userId', { userId: user.id });
    queryBuilder.leftJoinAndSelect('post.userLike', 'userLike');
    queryBuilder.leftJoinAndSelect('post.postLike', 'postLike');
    queryBuilder.leftJoinAndSelect('post.user', 'user');
    queryBuilder.loadRelationCountAndMap('post.commentsCount', 'post.comments');

    return await queryBuilder.getMany();
  }

  async getUserLikedPosts(userId: number) {
    const queryBuilder = this.postsService.createQueryBuilder('post');
    queryBuilder.where('post.userId = :userId', { userId });
    queryBuilder.leftJoinAndSelect('post.userLike', 'userLike');
    queryBuilder.leftJoinAndSelect('post.postLike', 'postLike');
    queryBuilder.leftJoinAndSelect('post.user', 'user');
    queryBuilder.loadRelationCountAndMap('post.commentsCount', 'post.comments');

    return await queryBuilder.getMany();
  }

  private async getOneBySlug(slug: string) {
    const post = await this.postsService.findOne({
      slug,
    });
    if (post) {
      const queryBuilder = this.postsService
        .createQueryBuilder('post')
        .where('post.slug = :slug', { slug })
        .leftJoinAndSelect('post.userLike', 'userLike')
        .leftJoinAndSelect('post.postLike', 'postLike')
        .leftJoinAndSelect('post.user', 'user')
        .loadRelationCountAndMap('post.commentsCount', 'post.comments');

      return await queryBuilder.getOne();
    }
  }

  private async getOneById(id: number) {
    const post = await this.postsService.findOne({
      id,
    });
    if (post) {
      const queryBuilder = this.postsService
        .createQueryBuilder('post')
        .where('post.id = :id', { id })
        .leftJoinAndSelect('post.userLike', 'userLike')
        .leftJoinAndSelect('post.postLike', 'postLike')
        .leftJoinAndSelect('post.user', 'user')
        .loadRelationCountAndMap('post.commentsCount', 'post.comments');

      return await queryBuilder.getOne();
    }
  }

  async getPostById(id: number) {
    const post = await this.getOneById(id);

    if (post) {
      return post;
    }

    return false;
  }

  async createPost(post: CreatePostDto, user: User) {
    const postModel: PostEntity = {
      ...post,
      user,
    };

    const model = await this.postsService.create(postModel);
    const save = await this.postsService.save(model);
    return await this.getOneBySlug(save.slug);
  }

  async removePost(postId: number, user: User) {
    const post = await this.postsService.findOne({ id: postId });

    if (post) {
      if (post.user.id !== user.id) {
        throw new Error('This post does not belongs to you');
      }

      await this.postsService.delete({ id: postId });

      return true;
    } else {
      throw new NotFoundException();
    }
  }
}
