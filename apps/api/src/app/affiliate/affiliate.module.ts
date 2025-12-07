import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AmazonModule } from './amazon/amazon.module';

@Module({
  imports: [ConfigModule, AmazonModule],
  exports: [AmazonModule],
})
export class AffiliateModule {}
