import axios from 'axios';
import * as cheerio from 'cheerio';
import { PageContent } from '@/types/knowledge';

export async function crawlPage(url: string): Promise<PageContent | null> {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AeroBotCrawler/1.0; +https://www.gmraerocity.com/)',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(data);

    // Remove unwanted elements
    $('script, style, nav, footer, iframe, noscript').remove();

    const title = $('title').text() || $('h1').first().text() || 'Untitled';
    const content = $('body').text().replace(/\s+/g, ' ').trim();
    
    // Simple category inference based on URL
    let category = 'general';
    if (url.includes('/stay')) category = 'hotel';
    else if (url.includes('/eat-drink')) category = 'dining';
    else if (url.includes('/work')) category = 'work';
    else if (url.includes('/events')) category = 'event';
    else if (url.includes('/parking')) category = 'parking';
    else if (url.includes('/retail')) category = 'retail';
    else if (url.includes('/relax')) category = 'relax';

    return {
      url,
      title,
      category,
      content,
      lastCrawled: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error crawling ${url}:`, error);
    return null;
  }
}
