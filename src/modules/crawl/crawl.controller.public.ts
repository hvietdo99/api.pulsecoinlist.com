import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CrawlService } from './crawl.service';

@Controller('public/crawl')
@ApiTags('public.crawl')
export class CrawlController {
  constructor(private readonly crawlService: CrawlService) {}

  @Post('/export')
  async export(@Body() url: string) {
    console.log({ url });
    return await this.crawlService.export(url);
  }
}
