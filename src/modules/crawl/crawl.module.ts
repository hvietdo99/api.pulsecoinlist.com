import { Module } from '@nestjs/common';
import { CrawlController } from './crawl.controller.public';
import { CrawlService } from './crawl.service';

@Module({
  controllers: [CrawlController],
  providers: [CrawlService],
  exports: [CrawlService],
})
export class CrawlModule {}
