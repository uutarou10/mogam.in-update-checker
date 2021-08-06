import Parser from 'rss-parser';
import crypto from 'crypto';
import {parse} from 'node-html-parser';
import axios from 'axios';

interface Article {
  link: string,
  title: string,
  contentSnippet: string,
  isoDate: string
}

const md5 = (str: string) => {
  return crypto.createHash('md5').update(str).digest('hex');
}

export const checker = async () => {
  const parser = new Parser();
  const feedUrls = [
    'https://note.com/mogamin3/rss',
    'https://yurufuwa-tech.hatenablog.com/rss',
    'https://zenn.dev/mogamin/feed',
    'https://qiita.com/mogamin3/feed'
  ];
  const articles = (await Promise.all(feedUrls.map(feedUrl => parser.parseURL(feedUrl))))
    .reduce<Article[]>((prev, current) => ([...prev, ...(current.items as Article[])]), []);
  const latestFeedHash = md5(JSON.stringify(articles))

  const articlesPage = await axios.get('https://mogam.in/articles')
  const currentFeedHash = parse(articlesPage.data).querySelector("meta[name='mogamin-feed-hash']")?.attrs.content ?? "";

  console.info({currentFeedHash, latestFeedHash});

  if (latestFeedHash !== currentFeedHash) {
    // invoke deploy and notify to Slack
    try {
      await axios.post(process.env.VERCEL_DEPLOY_HOOK_URL!);
    } catch(e) {
      await axios.post(process.env.SLACK_WEBHOOK_URL!, {text: "<!channel>\n:rotating_light: Deploy hook failed!"})
    }
    await axios.post(process.env.SLACK_WEBHOOK_URL!, {text: "<!channel>\n:rocket: Deploy started!"})
  } else {
    console.info("Deploy skipped!")
  }
}
