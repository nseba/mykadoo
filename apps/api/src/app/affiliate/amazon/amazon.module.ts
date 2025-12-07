import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AmazonService } from './amazon.service';
import { AmazonController } from './amazon.controller';

@Module({
  imports: [ConfigModule],
  controllers: [AmazonController],
  providers: [AmazonService],
  exports: [AmazonService],
})
export class AmazonModule {}
