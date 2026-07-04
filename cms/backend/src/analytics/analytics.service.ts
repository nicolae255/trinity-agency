import { Injectable } from '@nestjs/common';

export interface OverviewStats {
  totalPageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number; // seconds
}

export interface DailyPageViews {
  date: string; // ISO date string YYYY-MM-DD
  views: number;
}

export interface TopPage {
  path: string;
  views: number;
}

export interface TopPost {
  title: string;
  views: number;
}

@Injectable()
export class AnalyticsService {
  /**
   * Returns mocked high-level traffic overview statistics.
   */
  getOverview(): OverviewStats {
    return {
      totalPageViews: 48_320,
      uniqueVisitors: 12_840,
      bounceRate: 42.7,
      avgSessionDuration: 185, // seconds (~3 min 5 sec)
    };
  }

  /**
   * Returns a deterministic array of {date, views} for the requested number
   * of days, going back from today. The view count is seeded from the date
   * so the same request always returns the same data.
   */
  getPageViews(days: number = 30): DailyPageViews[] {
    const result: DailyPageViews[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const dateStr = date.toISOString().split('T')[0];

      // Deterministic seed: sum of char codes from the date string
      const seed = dateStr
        .split('')
        .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

      // Views oscillate between 200 and 2000
      const views = 200 + (seed % 1801);

      result.push({ date: dateStr, views });
    }

    return result;
  }

  /**
   * Returns a mocked top-pages list sorted by views descending.
   */
  getTopPages(limit: number = 10): TopPage[] {
    const allPages: TopPage[] = [
      { path: '/', views: 14_200 },
      { path: '/blog', views: 8_750 },
      { path: '/about', views: 5_430 },
      { path: '/contact', views: 3_210 },
      { path: '/services', views: 2_980 },
      { path: '/pricing', views: 2_540 },
      { path: '/blog/getting-started', views: 1_870 },
      { path: '/blog/design-trends-2024', views: 1_660 },
      { path: '/blog/typescript-tips', views: 1_410 },
      { path: '/portfolio', views: 1_200 },
      { path: '/blog/nestjs-tutorial', views: 980 },
      { path: '/team', views: 820 },
    ];

    return allPages.slice(0, Math.min(limit, allPages.length));
  }

  /**
   * Returns a mocked top-posts list sorted by views descending.
   */
  getTopPosts(limit: number = 10): TopPost[] {
    const allPosts: TopPost[] = [
      { title: 'Getting Started with NestJS', views: 4_210 },
      { title: 'TypeScript Tips and Tricks', views: 3_750 },
      { title: 'Design Trends in 2024', views: 3_100 },
      { title: 'Building a CMS from Scratch', views: 2_870 },
      { title: 'Prisma ORM Deep Dive', views: 2_340 },
      { title: 'React Performance Optimization', views: 1_980 },
      { title: 'Understanding JWT Authentication', views: 1_760 },
      { title: 'PostgreSQL Indexing Strategies', views: 1_520 },
      { title: 'CSS Grid vs Flexbox', views: 1_290 },
      { title: 'Deploying NestJS to Production', views: 1_040 },
    ];

    return allPosts.slice(0, Math.min(limit, allPosts.length));
  }
}
