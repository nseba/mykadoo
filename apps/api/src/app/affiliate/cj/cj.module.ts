import { Module } from '@nestjs/common';
import { CJService } from './cj.service';
import { CJController } from './cj.controller';

@Module({
  controllers: [CJController],
  providers: [CJService],
  exports: [CJService],
})
export class CJModule {}
