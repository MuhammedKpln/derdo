import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { PostLike } from 'src/likes/entities/PostLike.entity';
import { UserLike } from 'src/likes/entities/UserLike.entity';

export enum PostType {
  Content = 0,
  Instagram = 1,
  Twitter = 2,
  Youtube = 3,
  Blog = 4,
}

@ObjectType()
class ICount {
  @Field()
  comment: number;
}

@ObjectType()
export class PostEntity {
  @Field()
  id?: number;

  @Field({ nullable: true })
  title: string;

  @Field()
  content: string;

  @Field((returns) => User)
  user: User;

  @Field()
  type: PostType;

  @Field()
  slug?: string;

  @Field()
  created_at?: Date;

  @Field((_returns) => [Comment])
  comments?: Comment[];

  @Field((_returns) => UserLike, { nullable: true })
  userLike?: UserLike;

  @Field((_returns) => PostLike)
  postLike?: PostLike;

  updated_at?: Date;

  @Field((_) => ICount)
  _count?: ICount;

  @Field({ nullable: true })
  postFromFollowers?: boolean;
}
