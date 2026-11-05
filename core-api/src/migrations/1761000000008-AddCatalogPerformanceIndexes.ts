import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCatalogPerformanceIndexes1761000000008 implements MigrationInterface {
  name = 'AddCatalogPerformanceIndexes1761000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_foods_restaurant_status_sold_count" ON "foods" ("restaurant_id", "status", "sold_count" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_foods_category_status_created_at" ON "foods" ("category_id", "status", "created_at" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_foods_status_sold_count" ON "foods" ("status", "sold_count" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_foods_status_created_at" ON "foods" ("status", "created_at" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_restaurants_status_rating" ON "restaurants" ("status", "rating" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_toppings_food_available" ON "toppings" ("food_id", "is_available")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_reviews_food_rating" ON "reviews" ("food_id", "rating")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reviews_food_rating"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_toppings_food_available"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_restaurants_status_rating"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_foods_status_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_foods_status_sold_count"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_foods_category_status_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_foods_restaurant_status_sold_count"`);
  }
}

