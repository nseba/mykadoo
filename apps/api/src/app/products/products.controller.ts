import { Controller, Get, Post, Put, Delete, Body, Param, Query, Logger } from '@nestjs/common';
import { ProductsService, CreateProductDto, UpdateProductDto, ProductSearchFilters } from './products.service';

@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() createDto: CreateProductDto) {
    const product = await this.productsService.create(createDto);
    return { success: true, product };
  }

  @Get('search')
  async search(
    @Query('query') query?: string,
    @Query('category') category?: string,
    @Query('platform') platform?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('minRating') minRating?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const filters: ProductSearchFilters = {
      query,
      category,
      platform: platform as any,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0,
    };

    const result = await this.productsService.search(filters);
    return { success: true, ...result };
  }

  @Get('stats')
  async getStats() {
    const stats = await this.productsService.getStats();
    return { success: true, stats };
  }

  @Get('trending')
  async getTrending(@Query('limit') limit?: string) {
    const products = await this.productsService.getTrending(limit ? parseInt(limit) : 20);
    return { success: true, products };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const product = await this.productsService.findById(id);
    return { success: true, product };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateProductDto) {
    const product = await this.productsService.update(id, updateDto);
    return { success: true, product };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const product = await this.productsService.delete(id);
    return { success: true, product };
  }
}
