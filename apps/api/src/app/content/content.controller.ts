import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ContentService } from './content.service';
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

@ApiTags('Content')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // ==================== PUBLIC ARTICLE ENDPOINTS ====================

  @Get('articles')
  @ApiOperation({ summary: 'List articles with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of articles', type: PaginatedArticlesResponseDto })
  async listArticles(@Query() query: ArticleQueryDto): Promise<PaginatedArticlesResponseDto> {
    return this.contentService.listArticles(query);
  }

  @Get('articles/:slug')
  @ApiOperation({ summary: 'Get article by slug' })
  @ApiParam({ name: 'slug', description: 'Article slug' })
  @ApiResponse({ status: 200, description: 'Article details', type: ArticleResponseDto })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async getArticleBySlug(@Param('slug') slug: string): Promise<ArticleResponseDto> {
    // Increment view count
    const article = await this.contentService.getArticleBySlug(slug);
    await this.contentService.incrementViewCount(article.id);
    return article;
  }

  @Get('articles/:id/related')
  @ApiOperation({ summary: 'Get related articles' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of related articles (default: 6)' })
  @ApiResponse({ status: 200, description: 'Related articles', type: [ArticleResponseDto] })
  async getRelatedArticles(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ): Promise<ArticleResponseDto[]> {
    return this.contentService.getRelatedArticles(id, limit || 6);
  }

  // ==================== PUBLIC CATEGORY ENDPOINTS ====================

  @Get('categories')
  @ApiOperation({ summary: 'List all categories' })
  @ApiResponse({ status: 200, description: 'List of categories', type: [CategoryResponseDto] })
  async listCategories(@Query() query: CategoryQueryDto): Promise<CategoryResponseDto[]> {
    return this.contentService.listCategories(query);
  }

  @Get('categories/:slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiResponse({ status: 200, description: 'Category details', type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getCategoryBySlug(@Param('slug') slug: string): Promise<CategoryResponseDto> {
    return this.contentService.getCategoryBySlug(slug);
  }

  @Get('categories/:slug/articles')
  @ApiOperation({ summary: 'Get articles in a category' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiResponse({ status: 200, description: 'Articles in category', type: PaginatedArticlesResponseDto })
  async getCategoryArticles(
    @Param('slug') slug: string,
    @Query() query: ArticleQueryDto,
  ): Promise<PaginatedArticlesResponseDto> {
    return this.contentService.listArticles({ ...query, category: slug });
  }

  // ==================== PUBLIC TAG ENDPOINTS ====================

  @Get('tags')
  @ApiOperation({ summary: 'List all tags' })
  @ApiQuery({ name: 'includeCount', required: false, description: 'Include article counts' })
  @ApiResponse({ status: 200, description: 'List of tags', type: [TagResponseDto] })
  async listTags(@Query('includeCount') includeCount?: boolean): Promise<TagResponseDto[]> {
    return this.contentService.listTags(includeCount);
  }

  @Get('tags/:slug')
  @ApiOperation({ summary: 'Get tag by slug' })
  @ApiParam({ name: 'slug', description: 'Tag slug' })
  @ApiResponse({ status: 200, description: 'Tag details', type: TagResponseDto })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async getTagBySlug(@Param('slug') slug: string): Promise<TagResponseDto> {
    return this.contentService.getTagBySlug(slug);
  }

  @Get('tags/:slug/articles')
  @ApiOperation({ summary: 'Get articles with a tag' })
  @ApiParam({ name: 'slug', description: 'Tag slug' })
  @ApiResponse({ status: 200, description: 'Articles with tag', type: PaginatedArticlesResponseDto })
  async getTagArticles(
    @Param('slug') slug: string,
    @Query() query: ArticleQueryDto,
  ): Promise<PaginatedArticlesResponseDto> {
    return this.contentService.listArticles({ ...query, tag: slug });
  }

  // ==================== PUBLIC AUTHOR ENDPOINTS ====================

  @Get('authors')
  @ApiOperation({ summary: 'List all authors' })
  @ApiResponse({ status: 200, description: 'List of authors', type: [AuthorResponseDto] })
  async listAuthors(@Query() query: AuthorQueryDto): Promise<AuthorResponseDto[]> {
    return this.contentService.listAuthors(query);
  }

  @Get('authors/:slug')
  @ApiOperation({ summary: 'Get author by slug' })
  @ApiParam({ name: 'slug', description: 'Author slug' })
  @ApiResponse({ status: 200, description: 'Author details', type: AuthorResponseDto })
  @ApiResponse({ status: 404, description: 'Author not found' })
  async getAuthorBySlug(@Param('slug') slug: string): Promise<AuthorResponseDto> {
    return this.contentService.getAuthorBySlug(slug);
  }

  @Get('authors/:slug/articles')
  @ApiOperation({ summary: 'Get articles by an author' })
  @ApiParam({ name: 'slug', description: 'Author slug' })
  @ApiResponse({ status: 200, description: 'Articles by author', type: PaginatedArticlesResponseDto })
  async getAuthorArticles(
    @Param('slug') slug: string,
    @Query() query: ArticleQueryDto,
  ): Promise<PaginatedArticlesResponseDto> {
    return this.contentService.listArticles({ ...query, author: slug });
  }

  // ==================== SITEMAP DATA ====================

  @Get('sitemap/articles')
  @ApiOperation({ summary: 'Get article data for sitemap generation' })
  @ApiResponse({ status: 200, description: 'Sitemap article data' })
  async getSitemapArticles() {
    return this.contentService.getSitemapArticles();
  }

  @Get('sitemap/categories')
  @ApiOperation({ summary: 'Get category data for sitemap generation' })
  @ApiResponse({ status: 200, description: 'Sitemap category data' })
  async getSitemapCategories() {
    return this.contentService.getSitemapCategories();
  }

  @Get('sitemap/tags')
  @ApiOperation({ summary: 'Get tag data for sitemap generation' })
  @ApiResponse({ status: 200, description: 'Sitemap tag data' })
  async getSitemapTags() {
    return this.contentService.getSitemapTags();
  }
}

// ==================== ADMIN CONTROLLER ====================

@ApiTags('Content Admin')
@Controller('admin/content')
export class ContentAdminController {
  constructor(private readonly contentService: ContentService) {}

  // ==================== ADMIN ARTICLE ENDPOINTS ====================

  @Post('articles')
  @ApiOperation({ summary: 'Create a new article' })
  @ApiResponse({ status: 201, description: 'Article created', type: ArticleResponseDto })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  async createArticle(@Body() dto: CreateArticleDto): Promise<ArticleResponseDto> {
    return this.contentService.createArticle(dto);
  }

  @Get('articles')
  @ApiOperation({ summary: 'List all articles (admin view, includes drafts)' })
  @ApiResponse({ status: 200, description: 'Paginated list of articles', type: PaginatedArticlesResponseDto })
  async listArticles(@Query() query: ArticleQueryDto): Promise<PaginatedArticlesResponseDto> {
    return this.contentService.listArticles(query);
  }

  @Get('articles/:id')
  @ApiOperation({ summary: 'Get article by ID' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article details', type: ArticleResponseDto })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async getArticleById(@Param('id') id: string): Promise<ArticleResponseDto> {
    return this.contentService.getArticleById(id);
  }

  @Put('articles/:id')
  @ApiOperation({ summary: 'Update an article' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article updated', type: ArticleResponseDto })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  async updateArticle(
    @Param('id') id: string,
    @Body() dto: UpdateArticleDto,
  ): Promise<ArticleResponseDto> {
    return this.contentService.updateArticle(id, dto);
  }

  @Delete('articles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an article' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 204, description: 'Article deleted' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async deleteArticle(@Param('id') id: string): Promise<void> {
    return this.contentService.deleteArticle(id);
  }

  @Post('articles/:id/publish')
  @ApiOperation({ summary: 'Publish an article' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article published', type: ArticleResponseDto })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async publishArticle(@Param('id') id: string): Promise<ArticleResponseDto> {
    return this.contentService.publishArticle(id);
  }

  @Post('articles/:id/unpublish')
  @ApiOperation({ summary: 'Unpublish an article' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article unpublished', type: ArticleResponseDto })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async unpublishArticle(@Param('id') id: string): Promise<ArticleResponseDto> {
    return this.contentService.unpublishArticle(id);
  }

  // ==================== ADMIN CATEGORY ENDPOINTS ====================

  @Post('categories')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created', type: CategoryResponseDto })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  async createCategory(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return this.contentService.createCategory(dto);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category details', type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getCategoryById(@Param('id') id: string): Promise<CategoryResponseDto> {
    return this.contentService.getCategoryById(id);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category updated', type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.contentService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 204, description: 'Category deleted' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async deleteCategory(@Param('id') id: string): Promise<void> {
    return this.contentService.deleteCategory(id);
  }

  // ==================== ADMIN AUTHOR ENDPOINTS ====================

  @Post('authors')
  @ApiOperation({ summary: 'Create a new author' })
  @ApiResponse({ status: 201, description: 'Author created', type: AuthorResponseDto })
  @ApiResponse({ status: 409, description: 'Slug or email already exists' })
  async createAuthor(@Body() dto: CreateAuthorDto): Promise<AuthorResponseDto> {
    return this.contentService.createAuthor(dto);
  }

  @Get('authors/:id')
  @ApiOperation({ summary: 'Get author by ID' })
  @ApiParam({ name: 'id', description: 'Author ID' })
  @ApiResponse({ status: 200, description: 'Author details', type: AuthorResponseDto })
  @ApiResponse({ status: 404, description: 'Author not found' })
  async getAuthorById(@Param('id') id: string): Promise<AuthorResponseDto> {
    return this.contentService.getAuthorById(id);
  }

  @Put('authors/:id')
  @ApiOperation({ summary: 'Update an author' })
  @ApiParam({ name: 'id', description: 'Author ID' })
  @ApiResponse({ status: 200, description: 'Author updated', type: AuthorResponseDto })
  @ApiResponse({ status: 404, description: 'Author not found' })
  @ApiResponse({ status: 409, description: 'Slug or email already exists' })
  async updateAuthor(
    @Param('id') id: string,
    @Body() dto: UpdateAuthorDto,
  ): Promise<AuthorResponseDto> {
    return this.contentService.updateAuthor(id, dto);
  }

  @Delete('authors/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an author' })
  @ApiParam({ name: 'id', description: 'Author ID' })
  @ApiResponse({ status: 204, description: 'Author deleted' })
  @ApiResponse({ status: 404, description: 'Author not found' })
  @ApiResponse({ status: 400, description: 'Author has articles' })
  async deleteAuthor(@Param('id') id: string): Promise<void> {
    return this.contentService.deleteAuthor(id);
  }

  // ==================== ADMIN TAG ENDPOINTS ====================

  @Post('tags')
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ status: 201, description: 'Tag created', type: TagResponseDto })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  async createTag(@Body() dto: CreateTagDto): Promise<TagResponseDto> {
    return this.contentService.createTag(dto);
  }

  @Get('tags/:id')
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({ status: 200, description: 'Tag details', type: TagResponseDto })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async getTagById(@Param('id') id: string): Promise<TagResponseDto> {
    return this.contentService.getTagById(id);
  }

  @Put('tags/:id')
  @ApiOperation({ summary: 'Update a tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({ status: 200, description: 'Tag updated', type: TagResponseDto })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  @ApiResponse({ status: 409, description: 'Slug or name already exists' })
  async updateTag(@Param('id') id: string, @Body() dto: UpdateTagDto): Promise<TagResponseDto> {
    return this.contentService.updateTag(id, dto);
  }

  @Delete('tags/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({ status: 204, description: 'Tag deleted' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async deleteTag(@Param('id') id: string): Promise<void> {
    return this.contentService.deleteTag(id);
  }
}
