import { Module } from '@nestjs/common';
import { MODULE_METADATA } from '@nestjs/common/constants';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { validateEnv } from './config/env.validation';
import minioConfig from './config/minio.config';
import { DeliveryModule, FindShipperProcessor } from './features/delivery/public-api';
import { AppCacheModule } from './infra/cache/cache.module';
import { DatabaseModule } from './infra/database/database.module';
import { MapsModule } from './infra/mapbox/maps.module';
import { StorageModule } from './infra/minio/storage.module';

const deliveryRegistersProcessor = (
  Reflect.getMetadata(MODULE_METADATA.PROVIDERS, DeliveryModule) as unknown[]
).includes(FindShipperProcessor);

/**
 * The worker deliberately imports only the dependencies needed by delivery
 * assignment. HTTP controllers, payment gateways and notification providers
 * stay in the API process.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [minioConfig],
      validate: validateEnv,
    }),
    DatabaseModule,
    AppCacheModule,
    StorageModule,
    MapsModule,
    ScheduleModule.forRoot(),
    DeliveryModule,
  ],
  // Read Delivery's actual provider list; ConfigModule may load .env after Delivery was evaluated.
  providers: deliveryRegistersProcessor ? [] : [FindShipperProcessor],
})
export class WorkerModule {}
