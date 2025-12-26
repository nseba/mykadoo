import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ArticleStatus, ArticleContentType, Prisma } from '@prisma/client';
import {
  CreateArticleDto,
  UpdateArticleDto,
  ArticleQueryDto,
  ArticleResponseDto,
  PaginatedArticlesResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryQueryDto,
  CategoryResponseDto,
  CreateAuthorDto,
  UpdateAuthorDto,
  AuthorQueryDto,
  AuthorResponseDto,
  CreateTagDto,
  UpdateTagDto,
  TagResponseDto,
} from './dto';
import { PrismaService } from '../common/prisma';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== UTILITY METHODS ====================

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const text = content.replace(/<[^>]*>/g, ''); // Strip HTML
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  private countWords(content: string): number {
    const text = content.replace(/<[^>]*>/g, '');
    return text.split(/\s+/).filter(Boolean).length;
  }

  // ==================== ARTICLE METHODS ====================

  async createArticle(dto: CreateArticleDto): Promise<ArticleResponseDto> {
    const slug = dto.slug || this.generateSlug(dto.title);

    // Check for duplicate slug
    const existing = await this.prisma.article.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Article with slug "${slug}" already exists`);
    }

    // Verify author exists
    const author = await this.prisma.author.findUnique({ where: { id: dto.authorId } });
    if (!author) {
      throw new NotFoundException(`Author with ID "${dto.authorId}" not found`);
    }

    const readingTimeMinutes = this.calculateReadingTime(dto.content);
    const wordCount = this.countWords(dto.content);

    // Create article
    const article = await this.prisma.article.create({
      data: {
        title: dto.title,
        slug,
        excerpt: dto.excerpt,
        content: dto.content,
        authorId: dto.authorId,
        featuredImageUrl: dto.featuredImageUrl,
        featuredImageAlt: dto.featuredImageAlt,
        featuredImageCaption: dto.featuredImageCaption,
        contentType: (dto.contentType as ArticleContentType) || ArticleContentType.ARTICLE,
        status: (dto.status as ArticleStatus) || ArticleStatus.DRAFT,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        seoKeywords: dto.seoKeywords || [],
        canonicalUrl: dto.canonicalUrl,
        ogTitle: dto.ogTitle,
        ogDescription: dto.ogDescription,
        ogImageUrl: dto.ogImageUrl,
        readingTimeMinutes,
        wordCount,
        isFeatured: dto.isFeatured || false,
        publishedAt: dto.status === 'PUBLISHED' ? new Date() : null,
      },
      include: {
        author: true,
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    });

    // Handle categories
    if (dto.categoryIds && dto.categoryIds.length > 0) {
      await this.prisma.articleCategory.createMany({
        data: dto.categoryIds.map((categoryId, index) => ({
          articleId: article.id,
          categoryId,
          isPrimary: index === 0,
        })),
      });
    }

    // Handle tags
    if (dto.tags && dto.tags.length > 0) {
      for (const tagName of dto.tags) {
        const tagSlug = this.generateSlug(tagName);
        const tag = await this.prisma.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: tagName, slug: tagSlug },
        });
        await this.prisma.articleTag.create({
          data: { articleId: article.id, tagId: tag.id },
        });
      }
    }

    return this.getArticleById(article.id);
  }

  async updateArticle(id: string, dto: UpdateArticleDto): Promise<ArticleResponseDto> {
    const existing = await this.prisma.article.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Article with ID "${id}" not found`);
    }

    // Check slug uniqueness if changing
    if (dto.slug && dto.slug !== existing.slug) {
      const slugExists = await this.prisma.article.findUnique({ where: { slug: dto.slug } });
      if (slugExists) {
        throw new ConflictException(`Article with slug "${dto.slug}" already exists`);
      }
    }

    // Calculate reading metrics if content changed
    let readingTimeMinutes = existing.readingTimeMinutes;
    let wordCount = existing.wordCount;
    if (dto.content) {
      readingTimeMinutes = this.calculateReadingTime(dto.content);
      wordCount = this.countWords(dto.content);
    }

    // Determine publishedAt
    let publishedAt = existing.publishedAt;
    if (dto.status === 'PUBLISHED' && !existing.publishedAt) {
      publishedAt = new Date();
    }

    await this.prisma.article.update({
      where: { id },
      data: {
        title: dto.title,
        slug: dto.slug,
        excerpt: dto.excerpt,
        content: dto.content,
        authorId: dto.authorId,
        featuredImageUrl: dto.featuredImageUrl,
        featuredImageAlt: dto.featuredImageAlt,
        featuredImageCaption: dto.featuredImageCaption,
        contentType: dto.contentType as ArticleContentType,
        status: dto.status as ArticleStatus,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        publishedAt,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        seoKeywords: dto.seoKeywords,
        canonicalUrl: dto.canonicalUrl,
        ogTitle: dto.ogTitle,
        ogDescription: dto.ogDescription,
        ogImageUrl: dto.ogImageUrl,
        readingTimeMinutes,
        wordCount,
        isFeatured: dto.isFeatured,
      },
    });

    // Update categories if provided
    if (dto.categoryIds !== undefined) {
      await this.prisma.articleCategory.deleteMany({ where: { articleId: id } });
      if (dto.categoryIds.length > 0) {
        await this.prisma.articleCategory.createMany({
          data: dto.categoryIds.map((categoryId, index) => ({
            articleId: id,
            categoryId,
            isPrimary: index === 0,
          })),
        });
      }
    }

    // Update tags if provided
    if (dto.tags !== undefined) {
      await this.prisma.articleTag.deleteMany({ where: { articleId: id } });
      for (const tagName of dto.tags) {
        const tagSlug = this.generateSlug(tagName);
        const tag = await this.prisma.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: tagName, slug: tagSlug },
        });
        await this.prisma.articleTag.create({
          data: { articleId: id, tagId: tag.id },
        });
      }
    }

    return this.getArticleById(id);
  }

  async getArticleById(id: string): Promise<ArticleResponseDto> {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        author: true,
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID "${id}" not found`);
    }

    return this.mapArticleToResponse(article);
  }

  async getArticleBySlug(slug: string): Promise<ArticleResponseDto> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        author: true,
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    });

    if (!article) {
      throw new NotFoundException(`Article with slug "${slug}" not found`);
    }

    return this.mapArticleToResponse(article);
  }

  async listArticles(query: ArticleQueryDto): Promise<PaginatedArticlesResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ArticleWhereInput = {};

    if (query.status) {
      where.status = query.status as ArticleStatus;
    }

    if (query.contentType) {
      where.contentType = query.contentType as ArticleContentType;
    }

    if (query.featured !== undefined) {
      where.isFeatured = query.featured;
    }

    if (query.category) {
      where.categories = {
        some: { category: { slug: query.category } },
      };
    }

    if (query.tag) {
      where.tags = {
        some: { tag: { slug: query.tag } },
      };
    }

    if (query.author) {
      where.author = { slug: query.author };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { excerpt: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.ArticleOrderByWithRelationInput = {};
    const sortField = query.sortBy || 'publishedAt';
    const sortOrder = query.sortOrder || 'desc';
    orderBy[sortField] = sortOrder;

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        include: {
          author: true,
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.article.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: articles.map((a) => this.mapArticleToResponse(a)),
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  async deleteArticle(id: string): Promise<void> {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article with ID "${id}" not found`);
    }
    await this.prisma.article.delete({ where: { id } });
  }

  async publishArticle(id: string): Promise<ArticleResponseDto> {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article with ID "${id}" not found`);
    }

    await this.prisma.article.update({
      where: { id },
      data: {
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    return this.getArticleById(id);
  }

  async unpublishArticle(id: string): Promise<ArticleResponseDto> {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article with ID "${id}" not found`);
    }

    await this.prisma.article.update({
      where: { id },
      data: {
        status: ArticleStatus.DRAFT,
      },
    });

    return this.getArticleById(id);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.prisma.article.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  private mapArticleToResponse(article: any): ArticleResponseDto {
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      featuredImageUrl: article.featuredImageUrl,
      featuredImageAlt: article.featuredImageAlt,
      featuredImageCaption: article.featuredImageCaption,
      status: article.status,
      contentType: article.contentType,
      publishedAt: article.publishedAt,
      scheduledAt: article.scheduledAt,
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
      seoKeywords: article.seoKeywords,
      canonicalUrl: article.canonicalUrl,
      ogTitle: article.ogTitle,
      ogDescription: article.ogDescription,
      ogImageUrl: article.ogImageUrl,
      readingTimeMinutes: article.readingTimeMinutes,
      wordCount: article.wordCount,
      viewCount: article.viewCount,
      shareCount: article.shareCount,
      isFeatured: article.isFeatured,
      author: {
        id: article.author.id,
        name: article.author.name,
        slug: article.author.slug,
        avatarUrl: article.author.avatarUrl,
        bio: article.author.bio,
      },
      categories: article.categories.map((ac: any) => ({
        id: ac.category.id,
        name: ac.category.name,
        slug: ac.category.slug,
        isPrimary: ac.isPrimary,
      })),
      tags: article.tags.map((at: any) => ({
        id: at.tag.id,
        name: at.tag.name,
        slug: at.tag.slug,
      })),
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  }

  // ==================== CATEGORY METHODS ====================

  async createCategory(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const slug = dto.slug || this.generateSlug(dto.name);

    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Category with slug "${slug}" already exists`);
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        imageUrl: dto.imageUrl,
        parentId: dto.parentId,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        sortOrder: dto.sortOrder || 0,
        isActive: dto.isActive ?? true,
      },
    });

    return this.mapCategoryToResponse(category);
  }

  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const slugExists = await this.prisma.category.findUnique({ where: { slug: dto.slug } });
      if (slugExists) {
        throw new ConflictException(`Category with slug "${dto.slug}" already exists`);
      }
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        imageUrl: dto.imageUrl,
        parentId: dto.parentId,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive,
      },
    });

    return this.mapCategoryToResponse(category);
  }

  async getCategoryById(id: string): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { children: true },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return this.mapCategoryToResponse(category);
  }

  async getCategoryBySlug(slug: string): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: { children: true },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return this.mapCategoryToResponse(category);
  }

  async listCategories(query: CategoryQueryDto): Promise<CategoryResponseDto[]> {
    const where: Prisma.CategoryWhereInput = {};

    if (query.activeOnly) {
      where.isActive = true;
    }

    if (query.parentId !== undefined) {
      where.parentId = query.parentId === 'null' ? null : query.parentId;
    }

    const categories = await this.prisma.category.findMany({
      where,
      include: {
        children: true,
        _count: query.includeCount ? { select: { articles: true } } : undefined,
      },
      orderBy: { sortOrder: 'asc' },
    });

    return categories.map((c) => this.mapCategoryToResponse(c, query.includeCount));
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    await this.prisma.category.delete({ where: { id } });
  }

  private mapCategoryToResponse(category: any, includeCount = false): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
      parentId: category.parentId,
      seoTitle: category.seoTitle,
      seoDescription: category.seoDescription,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      articleCount: includeCount ? category._count?.articles : undefined,
      children: category.children?.map((c: any) => this.mapCategoryToResponse(c)),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  // ==================== AUTHOR METHODS ====================

  async createAuthor(dto: CreateAuthorDto): Promise<AuthorResponseDto> {
    const slug = dto.slug || this.generateSlug(dto.name);

    const existing = await this.prisma.author.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Author with slug "${slug}" already exists`);
    }

    if (dto.email) {
      const emailExists = await this.prisma.author.findUnique({ where: { email: dto.email } });
      if (emailExists) {
        throw new ConflictException(`Author with email "${dto.email}" already exists`);
      }
    }

    const author = await this.prisma.author.create({
      data: {
        name: dto.name,
        slug,
        email: dto.email,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
        twitterHandle: dto.twitterHandle,
        linkedinUrl: dto.linkedinUrl,
        websiteUrl: dto.websiteUrl,
        isActive: dto.isActive ?? true,
      },
    });

    return this.mapAuthorToResponse(author);
  }

  async updateAuthor(id: string, dto: UpdateAuthorDto): Promise<AuthorResponseDto> {
    const existing = await this.prisma.author.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Author with ID "${id}" not found`);
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const slugExists = await this.prisma.author.findUnique({ where: { slug: dto.slug } });
      if (slugExists) {
        throw new ConflictException(`Author with slug "${dto.slug}" already exists`);
      }
    }

    if (dto.email && dto.email !== existing.email) {
      const emailExists = await this.prisma.author.findUnique({ where: { email: dto.email } });
      if (emailExists) {
        throw new ConflictException(`Author with email "${dto.email}" already exists`);
      }
    }

    const author = await this.prisma.author.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug,
        email: dto.email,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
        twitterHandle: dto.twitterHandle,
        linkedinUrl: dto.linkedinUrl,
        websiteUrl: dto.websiteUrl,
        isActive: dto.isActive,
      },
    });

    return this.mapAuthorToResponse(author);
  }

  async getAuthorById(id: string): Promise<AuthorResponseDto> {
    const author = await this.prisma.author.findUnique({ where: { id } });
    if (!author) {
      throw new NotFoundException(`Author with ID "${id}" not found`);
    }
    return this.mapAuthorToResponse(author);
  }

  async getAuthorBySlug(slug: string): Promise<AuthorResponseDto> {
    const author = await this.prisma.author.findUnique({ where: { slug } });
    if (!author) {
      throw new NotFoundException(`Author with slug "${slug}" not found`);
    }
    return this.mapAuthorToResponse(author);
  }

  async listAuthors(query: AuthorQueryDto): Promise<AuthorResponseDto[]> {
    const where: Prisma.AuthorWhereInput = {};

    if (query.activeOnly) {
      where.isActive = true;
    }

    const authors = await this.prisma.author.findMany({
      where,
      include: {
        _count: query.includeCount ? { select: { articles: true } } : undefined,
      },
      orderBy: { name: 'asc' },
    });

    return authors.map((a) => this.mapAuthorToResponse(a, query.includeCount));
  }

  async deleteAuthor(id: string): Promise<void> {
    const author = await this.prisma.author.findUnique({ where: { id } });
    if (!author) {
      throw new NotFoundException(`Author with ID "${id}" not found`);
    }

    // Check if author has articles
    const articleCount = await this.prisma.article.count({ where: { authorId: id } });
    if (articleCount > 0) {
      throw new BadRequestException(`Cannot delete author with ${articleCount} articles. Reassign articles first.`);
    }

    await this.prisma.author.delete({ where: { id } });
  }

  private mapAuthorToResponse(author: any, includeCount = false): AuthorResponseDto {
    return {
      id: author.id,
      name: author.name,
      slug: author.slug,
      email: author.email,
      bio: author.bio,
      avatarUrl: author.avatarUrl,
      twitterHandle: author.twitterHandle,
      linkedinUrl: author.linkedinUrl,
      websiteUrl: author.websiteUrl,
      isActive: author.isActive,
      articleCount: includeCount ? author._count?.articles : undefined,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt,
    };
  }

  // ==================== TAG METHODS ====================

  async createTag(dto: CreateTagDto): Promise<TagResponseDto> {
    const slug = dto.slug || this.generateSlug(dto.name);

    const existing = await this.prisma.tag.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Tag with slug "${slug}" already exists`);
    }

    const tag = await this.prisma.tag.create({
      data: { name: dto.name, slug },
    });

    return this.mapTagToResponse(tag);
  }

  async updateTag(id: string, dto: UpdateTagDto): Promise<TagResponseDto> {
    const existing = await this.prisma.tag.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Tag with ID "${id}" not found`);
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const slugExists = await this.prisma.tag.findUnique({ where: { slug: dto.slug } });
      if (slugExists) {
        throw new ConflictException(`Tag with slug "${dto.slug}" already exists`);
      }
    }

    if (dto.name && dto.name !== existing.name) {
      const nameExists = await this.prisma.tag.findUnique({ where: { name: dto.name } });
      if (nameExists) {
        throw new ConflictException(`Tag with name "${dto.name}" already exists`);
      }
    }

    const tag = await this.prisma.tag.update({
      where: { id },
      data: { name: dto.name, slug: dto.slug },
    });

    return this.mapTagToResponse(tag);
  }

  async getTagById(id: string): Promise<TagResponseDto> {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundException(`Tag with ID "${id}" not found`);
    }
    return this.mapTagToResponse(tag);
  }

  async getTagBySlug(slug: string): Promise<TagResponseDto> {
    const tag = await this.prisma.tag.findUnique({ where: { slug } });
    if (!tag) {
      throw new NotFoundException(`Tag with slug "${slug}" not found`);
    }
    return this.mapTagToResponse(tag);
  }

  async listTags(includeCount = false): Promise<TagResponseDto[]> {
    const tags = await this.prisma.tag.findMany({
      include: {
        _count: includeCount ? { select: { articles: true } } : undefined,
      },
      orderBy: { name: 'asc' },
    });

    return tags.map((t) => this.mapTagToResponse(t, includeCount));
  }

  async deleteTag(id: string): Promise<void> {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundException(`Tag with ID "${id}" not found`);
    }
    await this.prisma.tag.delete({ where: { id } });
  }

  private mapTagToResponse(tag: any, includeCount = false): TagResponseDto {
    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      articleCount: includeCount ? tag._count?.articles : undefined,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    };
  }

  // ==================== RELATED ARTICLES ====================

  async getRelatedArticles(articleId: string, limit = 6): Promise<ArticleResponseDto[]> {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: {
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
      },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID "${articleId}" not found`);
    }

    const tagIds = article.tags.map((t) => t.tagId);
    const categoryIds = article.categories.map((c) => c.categoryId);

    // Find related articles by tags and categories
    const relatedArticles = await this.prisma.article.findMany({
      where: {
        id: { not: articleId },
        status: ArticleStatus.PUBLISHED,
        OR: [
          { tags: { some: { tagId: { in: tagIds } } } },
          { categories: { some: { categoryId: { in: categoryIds } } } },
        ],
      },
      include: {
        author: true,
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
    });

    return relatedArticles.map((a) => this.mapArticleToResponse(a));
  }

  // ==================== SITEMAP DATA ====================

  async getSitemapArticles(): Promise<{ slug: string; updatedAt: Date; publishedAt: Date }[]> {
    return this.prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async getSitemapCategories(): Promise<{ slug: string; updatedAt: Date }[]> {
    return this.prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      orderBy: { name: 'asc' },
    });
  }

  async getSitemapTags(): Promise<{ slug: string; updatedAt: Date }[]> {
    return this.prisma.tag.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { name: 'asc' },
    });
  }
}
