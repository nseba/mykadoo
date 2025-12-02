import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { SearchModule } from './search/search.module';
import { ProfilesModule } from './profiles/profiles.module';

@Module({
  imports: [SearchModule, ProfilesModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
