import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController, ContentAdminController } from './content.controller';

@Module({
  controllers: [ContentController, ContentAdminController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
