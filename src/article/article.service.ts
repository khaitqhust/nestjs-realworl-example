import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { ArticleEntity } from "./article.entity";
import { getRepository, Repository } from "typeorm";
import { CommentEntity } from "./comment.entity";
import { UserEntity } from "../user/user.entity";
import { FollowsEntity } from "../profile/follows.entity";
import { ArticleRO, ArticlesRO } from "./article.interface";

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowsEntity)
    private readonly followsRepository: Repository<FollowsEntity>
  ) {}

  async findAll(query): Promise<ArticlesRO> {
    const qb = await getRepository(ArticleEntity).createQueryBuilder("article").leftJoinAndSelect("article.author", "author");
    qb.where("1 = 1")

    if ("tag" in query) {
      qb.andWhere("article.tagList LIKE :tag", {tag: `%${query.tag}%`})
    }
    if ("author" in query) {
      const author = await this.userRepository.findOne({username: query.author})
      qb.andWhere("article.authorId = :id", {id: author.id})
    }
    if ("favorited" in query) {
      const author = await this.userRepository.findOne({username: query.favorited})
      const ids = author.favorites.map(el => el.id)
      qb.andWhere("article.authorId IN (:ids)", {ids})
    }
    qb.orderBy("article.created", "DESC")

    const articlesCount = await qb.getCount()

    if ("limit" in query) {
      qb.limit(query.limit)
    }
    if ("offset" in query) {
      qb.offset(query.offset)
    }

    const articles = await qb.getMany()
    return {articles, articlesCount}
  }

  async findFeed(userId: number, query): Promise<ArticlesRO> {
    const _follows = await this.followsRepository.find({followerId: userId})
    if (!(Array.isArray(_follows) && _follows.length > 0)) {
      return {articles: [], articlesCount: 0}
    }

    const ids = _follows.map(el => el.followingId)
    const qb = await getRepository(ArticleEntity).createQueryBuilder("article").where("article.authorId IN (:ids)", { ids })
    qb.orderBy("article.created", "DESC")

    const articlesCount = await qb.getCount()
    if ("limit" in query) {
      qb.limit(query.limit)
    }
    if ("offset" in query) {
      qb.offset(query.offset)
    }
    const articles = await qb.getMany()
    return {articles, articlesCount}
  }

  async findOne(where): Promise<ArticleRO> {
    const article = await this.articleRepository.findOne(where)
    return { article }
  }


}
