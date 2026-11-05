import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  PublicRestaurantsService,
  RestaurantDiscoveryQueryDto,
  RestaurantPageResponseDto,
  RestaurantResponseDto,
} from 'src/features/restaurants/public-api';
import { FoodIntegrationService } from '../foods/services/food-integration.service';

@ApiTags('Restaurant discovery')
@Controller('restaurants')
export class PublicRestaurantsController {
  constructor(
    private readonly restaurants: PublicRestaurantsService,
    private readonly foods: FoodIntegrationService,
  ) {}

  @Get('all')
  @ApiOperation({ summary: 'Liệt kê nhà hàng đã được duyệt' })
  @ApiResponse({ status: 200, type: RestaurantPageResponseDto })
  findAll(@Query() query: RestaurantDiscoveryQueryDto): Promise<RestaurantPageResponseDto> {
    return this.restaurants.findAll(query.page, query.pageSize, query.lat, query.lng);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Lấy nhà hàng đã duyệt kèm tối đa ba món đang bán' })
  @ApiResponse({ status: 200, schema: { example: { items: [{ id: 'uuid', foods: [] }] } } })
  async getPopularRestaurants(@Query() query: RestaurantDiscoveryQueryDto) {
    const { items } = await this.restaurants.getTopRestaurants(1, 3, query.lat, query.lng);
    const foodsByRestaurant = await this.foods.listMultipleRestaurantsFoodsCached(
      items.map((restaurant) => restaurant.id),
      3,
    );
    return {
      items: items.map((restaurant) => ({
        ...restaurant,
        foods: foodsByRestaurant.get(restaurant.id) ?? [],
      })),
    };
  }

  @Get('preview')
  @ApiOperation({ summary: 'Lấy bản xem trước của các nhà hàng đã duyệt' })
  @ApiResponse({ status: 200, type: RestaurantPageResponseDto })
  getPreview(@Query() query: RestaurantDiscoveryQueryDto): Promise<RestaurantPageResponseDto> {
    return this.restaurants.getPreview(query.page, query.pageSize, query.lat, query.lng);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một nhà hàng đã được duyệt' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: RestaurantResponseDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà hàng đã duyệt' })
  findOne(
    @Param('id') id: string,
    @Query() query: RestaurantDiscoveryQueryDto,
  ): Promise<RestaurantResponseDto> {
    return this.restaurants.findOne(id, query.lat, query.lng);
  }
}
