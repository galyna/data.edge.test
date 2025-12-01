import Parser from "rss-parser";
import crypto from "crypto";
import https from "https";
import http from "http";

/**
 * News Service - RSS Feed Aggregator
 *
 * Fetches and parses sports news from multiple RSS feeds.
 * Supports filtering by sport category and source.
 * Extracts Open Graph images from article pages.
 *
 * Free RSS Sources:
 * - ESPN (all sports)
 * - BBC Sport (football, tennis, basketball)
 * - Sky Sports (Premier League, F1)
 * - Bleacher Report (all sports)
 */

// RSS Feed Configuration
const RSS_FEEDS = {
  football: [
    {
      name: "ESPN",
      url: "https://www.espn.com/espn/rss/soccer/news",
      category: "Match Report",
    },
    {
      name: "BBC Sport",
      url: "https://feeds.bbci.co.uk/sport/football/rss.xml",
      category: "News",
    },
    {
      name: "Sky Sports",
      url: "https://www.skysports.com/rss/12040",
      category: "Premier League",
    },
  ],
  nba: [
    {
      name: "ESPN",
      url: "https://www.espn.com/espn/rss/nba/news",
      category: "NBA",
    },
    {
      name: "Bleacher Report",
      url: "https://bleacherreport.com/articles/feed?tag_id=19",
      category: "Analysis",
    },
  ],
  mlb: [
    {
      name: "ESPN",
      url: "https://www.espn.com/espn/rss/mlb/news",
      category: "MLB",
    },
  ],
  tennis: [
    {
      name: "ESPN",
      url: "https://www.espn.com/espn/rss/tennis/news",
      category: "Tennis",
    },
    {
      name: "BBC Sport",
      url: "https://feeds.bbci.co.uk/sport/tennis/rss.xml",
      category: "Match Report",
    },
  ],
  esports: [
    {
      name: "ESPN",
      url: "https://www.espn.com/espn/rss/esports/news",
      category: "Esports",
    },
  ],
  nfl: [
    {
      name: "ESPN",
      url: "https://www.espn.com/espn/rss/nfl/news",
      category: "NFL",
    },
  ],
  hockey: [
    {
      name: "ESPN",
      url: "https://www.espn.com/espn/rss/nhl/news",
      category: "NHL",
    },
  ],
};

// Sport-specific fallback images (Unsplash - free to use)
const SPORT_FALLBACK_IMAGES = {
  football: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80",
  nba: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
  mlb: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80",
  tennis: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
  esports: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
  nfl: "https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=800&q=80",
  hockey: "https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=800&q=80",
  default: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
};

export class NewsService {
  constructor() {
    this.name = "NewsService";
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DataEdge/1.0)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
      customFields: {
        item: [
          ["media:content", "mediaContent", { keepArray: true }],
          ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
        ],
      },
    });
    this.cache = new Map();
    this.cacheTTL = 10 * 60 * 1000; // 10 minutes
    this.ogCache = new Map(); // Cache for OG images
  }

  /**
   * Generate unique ID for article
   */
  generateId(url, title) {
    const content = `${url}${title}`;
    return crypto.createHash("md5").update(content).digest("hex").slice(0, 12);
  }

  /**
   * Clean HTML tags and entities
   */
  cleanHtml(text) {
    if (!text) return "";
    // Remove HTML tags
    let clean = text.replace(/<[^>]+>/g, "");
    // Decode HTML entities
    clean = clean
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ");
    // Remove extra whitespace
    clean = clean.replace(/\s+/g, " ").trim();
    return clean.slice(0, 500);
  }

  /**
   * Extract image URL from RSS entry
   */
  extractImage(item) {
    // Try media:content
    if (item.mediaContent && item.mediaContent.length > 0) {
      const media = item.mediaContent.find(
        (m) =>
          m.$.medium === "image" ||
          (m.$.url && m.$.url.match(/\.(jpg|jpeg|png|webp)$/i))
      );
      if (media) return media.$.url;
    }

    // Try media:thumbnail
    if (item.mediaThumbnail && item.mediaThumbnail.length > 0) {
      return item.mediaThumbnail[0].$.url;
    }

    // Try enclosure
    if (item.enclosure && item.enclosure.type?.startsWith("image/")) {
      return item.enclosure.url;
    }

    // Try to find image in content
    const content = item["content:encoded"] || item.content || item.summary || "";
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/);
    if (imgMatch) return imgMatch[1];

    return null;
  }

  /**
   * Fetch Open Graph image from article URL
   */
  async fetchOgImage(url) {
    if (!url) return null;

    // Check cache
    if (this.ogCache.has(url)) {
      return this.ogCache.get(url);
    }

    return new Promise((resolve) => {
      const protocol = url.startsWith("https") ? https : http;
      const timeout = setTimeout(() => {
        this.ogCache.set(url, null);
        resolve(null);
      }, 5000);

      const request = protocol.get(
        url,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; DataEdge/1.0; +https://data-edge.app)",
          },
          rejectUnauthorized: false,
        },
        (response) => {
          // Handle redirects
          if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            clearTimeout(timeout);
            this.fetchOgImage(response.headers.location).then(resolve);
            return;
          }

          if (response.statusCode !== 200) {
            clearTimeout(timeout);
            this.ogCache.set(url, null);
            resolve(null);
            return;
          }

          let html = "";
          response.setEncoding("utf8");

          response.on("data", (chunk) => {
            html += chunk;
            // Only read first 50KB
            if (html.length > 50000) {
              response.destroy();
            }
          });

          response.on("end", () => {
            clearTimeout(timeout);

            // Try og:image
            let match = html.match(
              /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
            );
            if (!match) {
              match = html.match(
                /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
              );
            }
            // Try twitter:image
            if (!match) {
              match = html.match(
                /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
              );
            }

            if (match && match[1].startsWith("http")) {
              this.ogCache.set(url, match[1]);
              resolve(match[1]);
            } else {
              this.ogCache.set(url, null);
              resolve(null);
            }
          });
        }
      );

      request.on("error", () => {
        clearTimeout(timeout);
        this.ogCache.set(url, null);
        resolve(null);
      });
    });
  }

  /**
   * Check if article is breaking news
   */
  isBreaking(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    const breakingKeywords = [
      "breaking",
      "just in",
      "confirmed",
      "official",
      "announces",
      "signs",
      "transfer",
      "injury update",
    ];
    return breakingKeywords.some((keyword) => text.includes(keyword));
  }

  /**
   * Fetch and parse a single RSS feed
   */
  async fetchFeed(feedConfig, sport, fetchImages = true) {
    const { name, url, category } = feedConfig;

    try {
      console.log(`[NEWS] Fetching ${name} (${sport})...`);
      const feed = await this.parser.parseURL(url);
      
      const articles = [];
      const items = feed.items.slice(0, 10); // Limit to 10 per feed

      for (const item of items) {
        const title = this.cleanHtml(item.title);
        const description = this.cleanHtml(
          item.contentSnippet || item.content || item.summary || ""
        );

        if (!title) continue;

        articles.push({
          id: this.generateId(item.link, title),
          title,
          description,
          url: item.link || "",
          imageUrl: this.extractImage(item),
          source: name,
          sport,
          category,
          author: item.creator || item.author || null,
          publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
          isBreaking: this.isBreaking(title, description),
        });
      }

      // Skip OG image fetching for performance - use fallback images instead
      // if (fetchImages) {
      //   const articlesNeedingImages = articles.filter((a) => !a.imageUrl);
      //   if (articlesNeedingImages.length > 0) {
      //     const ogImages = await Promise.all(
      //       articlesNeedingImages.map((a) => this.fetchOgImage(a.url))
      //     );
      //     articlesNeedingImages.forEach((article, index) => {
      //       if (ogImages[index]) article.imageUrl = ogImages[index];
      //     });
      //   }
      // }

      console.log(`[NEWS] Fetched ${articles.length} articles from ${name} (${sport})`);
      return articles;
    } catch (error) {
      console.error(`[NEWS] Error fetching ${url}:`, error.message);
      return [];
    }
  }

  /**
   * Get news articles with filters
   * @param {Object} options
   * @param {string} options.sport - Sport filter (football, nba, mlb, tennis, esports, all)
   * @param {string} options.source - Source filter (ESPN, BBC Sport, etc.)
   * @param {string} options.search - Search query
   * @param {number} options.limit - Maximum articles to return
   */
  async getNews({ sport = "all", source = null, search = null, limit = 20 } = {}) {
    try {
      // Determine feeds to fetch
      let feedsToFetch = [];

      if (sport.toLowerCase() === "all") {
        for (const [sportKey, feeds] of Object.entries(RSS_FEEDS)) {
          for (const feed of feeds) {
            feedsToFetch.push({ feed, sport: sportKey });
          }
        }
      } else {
        const sportLower = sport.toLowerCase();
        if (!RSS_FEEDS[sportLower]) {
          return {
            success: false,
            error: `Unknown sport: ${sport}. Available: ${Object.keys(RSS_FEEDS).join(", ")}`,
            articles: [],
            total: 0,
          };
        }
        feedsToFetch = RSS_FEEDS[sportLower].map((feed) => ({
          feed,
          sport: sportLower,
        }));
      }

      // Filter by source if specified
      if (source) {
        const sourceLower = source.toLowerCase();
        feedsToFetch = feedsToFetch.filter(
          ({ feed }) => feed.name.toLowerCase() === sourceLower
        );
      }

      if (feedsToFetch.length === 0) {
        return {
          success: true,
          articles: [],
          total: 0,
        };
      }

      // Fetch all feeds concurrently
      const results = await Promise.all(
        feedsToFetch.map(({ feed, sport }) => this.fetchFeed(feed, sport))
      );

      // Flatten results
      let allArticles = results.flat();

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        allArticles = allArticles.filter(
          (a) =>
            a.title.toLowerCase().includes(searchLower) ||
            a.description.toLowerCase().includes(searchLower)
        );
      }

      // Sort by date (newest first) and breaking news priority
      allArticles.sort((a, b) => {
        // Breaking news first
        if (a.isBreaking && !b.isBreaking) return -1;
        if (!a.isBreaking && b.isBreaking) return 1;
        // Then by date
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      });

      // Apply limit
      const limitedArticles = allArticles.slice(0, limit);

      // Apply fallback images
      const articlesWithImages = limitedArticles.map((a) => ({
        ...a,
        imageUrl: a.imageUrl || SPORT_FALLBACK_IMAGES[a.sport] || SPORT_FALLBACK_IMAGES.default,
      }));

      return {
        success: true,
        articles: articlesWithImages,
        total: articlesWithImages.length,
      };
    } catch (error) {
      console.error("[NEWS] Error:", error);
      return {
        success: false,
        error: error.message,
        articles: [],
        total: 0,
      };
    }
  }

  /**
   * Get available sources
   */
  getSources() {
    const sources = new Set();
    for (const feeds of Object.values(RSS_FEEDS)) {
      for (const feed of feeds) {
        sources.add(feed.name);
      }
    }
    return Array.from(sources).sort();
  }

  /**
   * Get available sports
   */
  getSports() {
    return Object.keys(RSS_FEEDS).sort();
  }
}

export const newsService = new NewsService();
