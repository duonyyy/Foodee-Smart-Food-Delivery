import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventsModule } from '../../common/events/events.module';
import { HttpContractModule } from '../../common/http-contract/http-contract.module';
import { RequestContextModule } from '../../common/request-context/request-context.module';
import { validateEnv } from '../../config/env.validation';
import minioConfig from '../../config/minio.config';
import { AppCacheModule } from '../cache/cache.module';
import { DatabaseModule } from '../database/database.module';
import { LoggingModule } from '../logging/logging.module';
import { MapsModule } from '../mapbox/maps.module';
import { StorageModule } from '../minio/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [minioConfig],
      validate: validateEnv,
    }),
    DatabaseModule,
    EventsModule,
    RequestContextModule,
    LoggingModule,
    HttpContractModule,
    AppCacheModule,
    StorageModule,
    MapsModule,
    ScheduleModule.forRoot(),
  ],
})
export class InfraCoreModule {}
