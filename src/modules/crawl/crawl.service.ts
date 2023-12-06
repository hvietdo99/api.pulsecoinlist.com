import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { MAX, amountSelector, cssSelector, exportToExcel } from './crawl.utils';

@Injectable()
export class CrawlService {
  public async export(url: string) {
    let tryCrawl = 0;
    const resutls = [];

    try {
      const browser = await puppeteer.launch({ headless: 'new' });
      const crawlUrl = async () => {
        console.log({ tryCrawl });
        if (tryCrawl === MAX) return;
        tryCrawl++;

        const page = await browser.newPage();
        await page.setViewport({
          width: 1920,
          height: 2180,
        });

        await page.goto(url, { waitUntil: 'networkidle0', timeout: 50000 });
        await page.waitForSelector(cssSelector, { visible: true });

        const totalText = await page.$$eval(amountSelector, (elements) => {
          return elements.map((e) => e.innerHTML);
        });
        const [total] = totalText[0].split(' ');
        console.log({ total });
        let index = 0;

        while (resutls.length <= Number(total) && index < 30) {
          console.log(resutls.length);
          index = index + 1;
          await page.keyboard.press('PageDown');
          const divCount = await page.$$eval(cssSelector, (elements) => {
            return elements.map((e) => e.href);
          });
          divCount.forEach((url) => {
            if (!resutls.includes(url)) resutls.push(url);
          });

          if (resutls.length < Number(total) && index === 30) {
            await crawlUrl();
            break;
          }
        }

        return resutls;
      };

      const urls = await crawlUrl();
      exportToExcel(urls);
      await browser.close();
    } catch (e) {
      console.error(e);
      return e;
    }
  }
}
