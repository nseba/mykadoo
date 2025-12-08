import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AmazonModule } from './amazon/amazon.module';
import { ShareASaleModule } from './shareasale/shareasale.module';

@Module({
  imports: [ConfigModule, AmazonModule, ShareASaleModule],
  exports: [AmazonModule, ShareASaleModule],
})
export class AffiliateModule {}
