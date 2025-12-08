import { Module } from '@nestjs/common';
import { ShareASaleService } from './shareasale.service';
import { ShareASaleController } from './shareasale.controller';

@Module({
  controllers: [ShareASaleController],
  providers: [ShareASaleService],
  exports: [ShareASaleService],
})
export class ShareASaleModule {}
