import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AmazonModule } from './amazon/amazon.module';
import { ShareASaleModule } from './shareasale/shareasale.module';
import { CJModule } from './cj/cj.module';

@Module({
  imports: [ConfigModule, AmazonModule, ShareASaleModule, CJModule],
  exports: [AmazonModule, ShareASaleModule, CJModule],
})
export class AffiliateModule {}
