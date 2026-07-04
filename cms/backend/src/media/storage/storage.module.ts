import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LocalStorageService } from './local-storage.service';
import { STORAGE_SERVICE } from './storage.interface';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: STORAGE_SERVICE,
      useClass: LocalStorageService,
    },
    // Provide the concrete class as well so it can be injected by class token if needed
    LocalStorageService,
  ],
  exports: [STORAGE_SERVICE, LocalStorageService],
})
export class StorageModule {}
