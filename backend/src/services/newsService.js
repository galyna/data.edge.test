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
 * - Fox Sports (NFL, NBA, MLB, Soccer)
 * - CBS Sports (NFL, NBA, MLB, NHL, College)
 * - The Guardian (Football, Cricket, Tennis)
 * - Yahoo Sports (NFL, NBA, MLB, NHL)
 * - NBC Sports (Olympics, Soccer, NFL)
 * - Bleacher Report (all sports)
 */

// Configuration for OG image extraction
const OG_CONFIG = {
  enabled: true, // Enable OG image extraction
  concurrencyLimit: 8, // Max parallel requests (increased for speed)
  timeout: 5000, // Timeout per request (ms) - reduced for faster response
  maxHtmlSize: 50000, // Max HTML to read (bytes) - OG tags are usually early
  cacheTTL: 60 * 60 * 1000, // Cache OG images for 1 hour
  maxArticlesToFetch: 10, // Max articles to fetch OG images for
  debug: process.env.NODE_ENV === "development", // Enable debug logging in dev only
};

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
    {
      name: "The Guardian",
      url: "https://www.theguardian.com/football/rss",
      category: "Analysis",
    },
    {
      name: "Fox Sports",
      url: "https://api.foxsports.com/v2/content/optimized-rss?partnerKey=MB0Wehpmuj2lUhuRhQaafhBjAJqaPU244mlTDK1i&size=30&tags=fs/soccer",
      category: "Soccer",
    },
  ],
  nba: [
    {
      name: "ESPN",
      url: "https://www.espn.com/espn/rss/nba/news",
      category: "NBA",
    },
    {
      name: "CBS Sports",
      url: "https://www.cbssports.com/rss/headlines/nba/",
      category: "NBA News",
    },
    {
      name: "Yahoo Sports",
      url: "https://sports.yahoo.com/nba/rss/",
      category: "NBA",
    },
    {
      name: "Fox Sports",
      url: "https://api.foxsports.com/v2/content/optimized-rss?partnerKey=MB0Wehpmuj2lUhuRhQaafhBjAJqaPU244mlTDK1i&size=30&tags=fs/nba",
      category: "NBA",
    },
  ],
  mlb: [
    {
      name: "ESPN",
      url: "https://www.espn.com/espn/rss/mlb/news",
      category: "MLB",
    },
    {
      name: "CBS Sports",
      url: "https://www.cbssports.com/rss/headlines/mlb/",
      category: "MLB News",
    },
    {
      name: "Yahoo Sports",
      url: "https://sports.yahoo.com/mlb/rss/",
      category: "MLB",
    },
    {
      name: "Fox Sports",
      url: "https://api.foxsports.com/v2/content/optimized-rss?partnerKey=MB0Wehpmuj2lUhuRhQaafhBjAJqaPU244mlTDK1i&size=30&tags=fs/mlb",
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
    {
      name: "The Guardian",
      url: "https://www.theguardian.com/sport/tennis/rss",
      category: "Analysis",
    },
    {
      name: "Sky Sports",
      url: "https://www.skysports.com/rss/12110",
      category: "Tennis",
    },
  ],
  esports: [
    {
      name: "Counter-Strike",
      url: "https://www.hltv.org/rss/news",
      category: "CS2",
    },
    {
      name: "Valorant",
      url: "https://www.vlr.gg/rss",
      category: "Valorant",
    },
    {
      name: "Dota 2",
      url: "https://www.gosugamers.net/dota2/rss",
      category: "Dota 2",
    },
    {
      name: "League of Legends",
      url: "https://www.gosugamers.net/lol/rss",
      category: "LoL",
    },
  ],
  nfl: [
    {
      name: "ESPN",
      url: "https://www.espn.com/espn/rss/nfl/news",
      category: "NFL",
    },
    {
      name: "CBS Sports",
      url: "https://www.cbssports.com/rss/headlines/nfl/",
      category: "NFL News",
    },
    {
      name: "Yahoo Sports",
      url: "https://sports.yahoo.com/nfl/rss/",
      category: "NFL",
    },
    {
      name: "Fox Sports",
      url: "https://api.foxsports.com/v2/content/optimized-rss?partnerKey=MB0Wehpmuj2lUhuRhQaafhBjAJqaPU244mlTDK1i&size=30&tags=fs/nfl",
      category: "NFL",
    },
    {
      name: "NBC Sports",
      url: "https://profootballtalk.nbcsports.com/feed/",
      category: "Pro Football Talk",
    },
  ],
  hockey: [
    {
      name: "ESPN",
      url: "https://www.espn.com/espn/rss/nhl/news",
      category: "NHL",
    },
    {
      name: "CBS Sports",
      url: "https://www.cbssports.com/rss/headlines/nhl/",
      category: "NHL News",
    },
    {
      name: "Yahoo Sports",
      url: "https://sports.yahoo.com/nhl/rss/",
      category: "NHL",
    },
    {
      name: "NBC Sports",
      url: "https://nhl.nbcsports.com/feed/",
      category: "NHL",
    },
    {
      name: "Fox Sports",
      url: "https://api.foxsports.com/v2/content/optimized-rss?partnerKey=MB0Wehpmuj2lUhuRhQaafhBjAJqaPU244mlTDK1i&size=30&tags=fs/nhl",
      category: "NHL",
    },
  ],
  // New sport categories
  f1: [
    {
      name: "ESPN",
      url: "https://www.espn.com/espn/rss/rpm/news",
      category: "Racing",
    },
    {
      name: "BBC Sport",
      url: "https://feeds.bbci.co.uk/sport/formula1/rss.xml",
      category: "Formula 1",
    },
    {
      name: "Sky Sports",
      url: "https://www.skysports.com/rss/12433", // F1 feed
      category: "F1",
    },
    {
      name: "The Guardian",
      url: "https://www.theguardian.com/sport/formulaone/rss",
      category: "Analysis",
    },
  ],
  cricket: [
    {
      name: "ESPN",
      url: "https://www.espncricinfo.com/rss/content/story/feeds/0.xml",
      category: "Cricket",
    },
    {
      name: "BBC Sport",
      url: "https://feeds.bbci.co.uk/sport/cricket/rss.xml",
      category: "Cricket",
    },
    {
      name: "The Guardian",
      url: "https://www.theguardian.com/sport/cricket/rss",
      category: "Analysis",
    },
    {
      name: "Sky Sports",
      url: "https://www.skysports.com/rss/12123",
      category: "Cricket",
    },
  ],
  golf: [
    {
      name: "ESPN",
      url: "https://www.espn.com/espn/rss/golf/news",
      category: "Golf",
    },
    {
      name: "BBC Sport",
      url: "https://feeds.bbci.co.uk/sport/golf/rss.xml",
      category: "Golf",
    },
    {
      name: "CBS Sports",
      url: "https://www.cbssports.com/rss/headlines/golf/",
      category: "Golf News",
    },
    {
      name: "Fox Sports",
      url: "https://api.foxsports.com/v2/content/optimized-rss?partnerKey=MB0Wehpmuj2lUhuRhQaafhBjAJqaPU244mlTDK1i&size=30&tags=fs/golf",
      category: "Golf",
    },
    {
      name: "Sky Sports",
      url: "https://www.skysports.com/rss/12176",
      category: "Golf",
    },
  ],
  mma: [
    {
      name: "ESPN",
      url: "https://www.espn.com/espn/rss/mma/news",
      category: "MMA",
    },
    {
      name: "Fox Sports",
      url: "https://api.foxsports.com/v2/content/optimized-rss?partnerKey=MB0Wehpmuj2lUhuRhQaafhBjAJqaPU244mlTDK1i&size=30&tags=fs/ufc",
      category: "UFC",
    },
    {
      name: "Yahoo Sports",
      url: "https://sports.yahoo.com/mma/rss/",
      category: "MMA",
    },
    {
      name: "CBS Sports",
      url: "https://www.cbssports.com/rss/headlines/mma/",
      category: "MMA News",
    },
  ],
  boxing: [
    {
      name: "ESPN",
      url: "https://www.espn.com/espn/rss/boxing/news",
      category: "Boxing",
    },
    {
      name: "Sky Sports",
      url: "https://www.skysports.com/rss/12178",
      category: "Boxing",
    },
    {
      name: "BBC Sport",
      url: "https://feeds.bbci.co.uk/sport/boxing/rss.xml",
      category: "Boxing",
    },
    {
      name: "The Guardian",
      url: "https://www.theguardian.com/sport/boxing/rss",
      category: "Analysis",
    },
  ],
  college: [
    {
      name: "ESPN",
      url: "https://www.espn.com/espn/rss/ncf/news",
      category: "College Football",
    },
    {
      name: "ESPN Basketball",
      url: "https://www.espn.com/espn/rss/ncb/news",
      category: "College Basketball",
    },
    {
      name: "CBS Sports",
      url: "https://www.cbssports.com/rss/headlines/college-football/",
      category: "CFB",
    },
    {
      name: "Yahoo Sports",
      url: "https://sports.yahoo.com/college-football/rss/",
      category: "College Football",
    },
  ],
  olympics: [
    {
      name: "NBC Sports",
      url: "https://olympics.nbcsports.com/feed/",
      category: "Olympics",
    },
    {
      name: "BBC Sport",
      url: "https://feeds.bbci.co.uk/sport/olympics/rss.xml",
      category: "Olympics",
    },
    {
      name: "ESPN",
      url: "https://www.espn.com/espn/rss/olympics/news",
      category: "Olympics",
    },
    {
      name: "The Guardian",
      url: "https://www.theguardian.com/sport/olympics-2024/rss",
      category: "Analysis",
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
  f1: "https://images.unsplash.com/photo-1504707748692-419802cf939d?w=800&q=80",
  cricket: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80",
  golf: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80",
  mma: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=80",
  boxing: "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800&q=80",
  college: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&q=80",
  olympics: "https://images.unsplash.com/photo-1569517282132-25d22f4573e6?w=800&q=80",
  default: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
};

export class NewsService {
  constructor() {
    this.name = "NewsService";
    
    // Create HTTPS agent that accepts self-signed certificates
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });
    
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      requestOptions: {
        agent: httpsAgent,
        rejectUnauthorized: false,
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
   * @param {string} url - Article URL
   * @param {string} title - Article title
   * @param {string} source - Source name (to ensure uniqueness across sources)
   */
  generateId(url, title, source = "") {
    const content = `${source}:${url}:${title}`;
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
   * Fetch Open Graph image from article URL with caching and TTL
   * @param {string} url - Article URL to fetch OG image from
   * @returns {Promise<string|null>} - Image URL or null
   */
  async fetchOgImage(url) {
    if (!url) return null;

    // Check cache with TTL
    const cached = this.ogCache.get(url);
    if (cached) {
      if (Date.now() - cached.timestamp < OG_CONFIG.cacheTTL) {
        return cached.imageUrl;
      }
      // Cache expired, remove it
      this.ogCache.delete(url);
    }

    return new Promise((resolve) => {
      const protocol = url.startsWith("https") ? https : http;
      const timeout = setTimeout(() => {
        if (OG_CONFIG.debug) {
          console.log(`[OG] Timeout (${OG_CONFIG.timeout}ms) for ${url.substring(0, 50)}...`);
        }
        this.cacheOgImage(url, null);
        resolve(null);
      }, OG_CONFIG.timeout);

      const request = protocol.get(
        url,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
          },
          rejectUnauthorized: false,
          timeout: OG_CONFIG.timeout,
        },
        (response) => {
          if (OG_CONFIG.debug) {
            console.log(`[OG] Response ${response.statusCode} from ${url.substring(0, 50)}...`);
          }
          
          // Handle redirects
          if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            clearTimeout(timeout);
            if (OG_CONFIG.debug) {
              console.log(`[OG] Redirect to ${response.headers.location.substring(0, 50)}...`);
            }
            this.fetchOgImage(response.headers.location).then(resolve);
            return;
          }

          if (response.statusCode !== 200) {
            clearTimeout(timeout);
            if (OG_CONFIG.debug) {
              console.log(`[OG] Non-200 status: ${response.statusCode}`);
            }
            this.cacheOgImage(url, null);
            resolve(null);
            return;
          }

          let html = "";
          let resolved = false;
          response.setEncoding("utf8");

          response.on("data", (chunk) => {
            if (resolved) return;
            
            html += chunk;
            
            // Try to extract OG image from accumulated HTML
            // OG tags are usually in <head>, so we can find them early
            const imageUrl = this.extractOgImageFromHtml(html);
            if (imageUrl) {
              resolved = true;
              clearTimeout(timeout);
              response.destroy();
              if (OG_CONFIG.debug) {
                console.log(`[OG] Found image early (${html.length} bytes): ${imageUrl.substring(0, 60)}...`);
              }
              this.cacheOgImage(url, imageUrl);
              resolve(imageUrl);
              return;
            }
            
            // Stop if we've read enough and still no OG image
            if (html.length > OG_CONFIG.maxHtmlSize) {
              resolved = true;
              clearTimeout(timeout);
              response.destroy();
              if (OG_CONFIG.debug) {
                console.log(`[OG] Max size reached (${html.length} bytes), no OG image found`);
              }
              this.cacheOgImage(url, null);
              resolve(null);
            }
          });

          response.on("end", () => {
            if (resolved) return;
            resolved = true;
            clearTimeout(timeout);
            if (OG_CONFIG.debug) {
              console.log(`[OG] Stream ended (${html.length} bytes), checking for OG image...`);
            }
            const imageUrl = this.extractOgImageFromHtml(html);
            if (OG_CONFIG.debug && imageUrl) {
              console.log(`[OG] Found image: ${imageUrl.substring(0, 80)}...`);
            }
            this.cacheOgImage(url, imageUrl);
            resolve(imageUrl);
          });
          
          response.on("close", () => {
            if (resolved) return;
            resolved = true;
            clearTimeout(timeout);
            // Try to extract from what we have
            const imageUrl = this.extractOgImageFromHtml(html);
            this.cacheOgImage(url, imageUrl);
            resolve(imageUrl);
          });
        }
      );

      request.on("error", (err) => {
        clearTimeout(timeout);
        if (OG_CONFIG.debug) {
          console.log(`[OG] Error fetching ${url.substring(0, 50)}...: ${err.message}`);
        }
        this.cacheOgImage(url, null);
        resolve(null);
      });

      request.on("timeout", () => {
        request.destroy();
        clearTimeout(timeout);
        if (OG_CONFIG.debug) {
          console.log(`[OG] Timeout fetching ${url.substring(0, 50)}...`);
        }
        this.cacheOgImage(url, null);
        resolve(null);
      });
    });
  }

  /**
   * Extract OG image URL from HTML content
   * @param {string} html - HTML content
   * @returns {string|null} - Image URL or null
   */
  extractOgImageFromHtml(html) {
    // Try og:image (property attribute first)
    let match = html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
    );
    
    // Try og:image (content attribute first)
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
    
    // Try twitter:image (content first)
    if (!match) {
      match = html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i
      );
    }

    // Try article:image
    if (!match) {
      match = html.match(
        /<meta[^>]+property=["']article:image["'][^>]+content=["']([^"']+)["']/i
      );
    }

    if (match && match[1]) {
      const imageUrl = match[1].trim();
      // Validate URL
      if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        return imageUrl;
      }
    }

    return null;
  }

  /**
   * Cache OG image with timestamp for TTL
   * @param {string} url - Article URL
   * @param {string|null} imageUrl - Image URL or null
   */
  cacheOgImage(url, imageUrl) {
    this.ogCache.set(url, {
      imageUrl,
      timestamp: Date.now(),
    });
  }

  /**
   * Fetch OG images for multiple articles with concurrency limit
   * @param {Array} articles - Articles needing images
   * @returns {Promise<void>}
   */
  async fetchOgImagesWithConcurrency(articles) {
    let articlesNeedingImages = articles.filter((a) => !a.imageUrl);
    
    if (articlesNeedingImages.length === 0) {
      return;
    }

    // Limit number of OG fetches for speed
    const maxToFetch = OG_CONFIG.maxArticlesToFetch || 10;
    if (articlesNeedingImages.length > maxToFetch) {
      console.log(`[NEWS] Limiting OG fetch from ${articlesNeedingImages.length} to ${maxToFetch} articles`);
      articlesNeedingImages = articlesNeedingImages.slice(0, maxToFetch);
    }

    console.log(`[NEWS] Fetching OG images for ${articlesNeedingImages.length} articles...`);

    // Process all in parallel with concurrency limit
    const batchSize = OG_CONFIG.concurrencyLimit;
    
    for (let i = 0; i < articlesNeedingImages.length; i += batchSize) {
      const batch = articlesNeedingImages.slice(i, i + batchSize);
      const promises = batch.map((article) => 
        this.fetchOgImage(article.url).then((imageUrl) => {
          if (imageUrl) {
            article.imageUrl = imageUrl;
          }
        })
      );
      
      await Promise.all(promises);
    }

    const foundCount = articlesNeedingImages.filter((a) => a.imageUrl).length;
    console.log(`[NEWS] Found OG images for ${foundCount}/${articlesNeedingImages.length} articles`);
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

    // Check cache
    if (this.cache.has(url)) {
      const cached = this.cache.get(url);
      if (Date.now() - cached.timestamp < this.cacheTTL) {
        console.log(`[NEWS] Returning cached feed for ${name} (${sport})`);
        return cached.data;
      }
    }

    try {
      console.log(`[NEWS] Fetching ${name} (${sport})...`);
      const feed = await this.parser.parseURL(url);
      
      const articles = [];
      const items = feed.items.slice(0, 5); // Limit to 5 per feed for faster loading

      for (const item of items) {
        const title = this.cleanHtml(item.title);
        const description = this.cleanHtml(
          item.contentSnippet || item.content || item.summary || ""
        );

        if (!title) continue;

        articles.push({
          id: this.generateId(item.link, title, name),
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

      console.log(`[NEWS] Fetched ${articles.length} articles from ${name} (${sport})`);
      
      // Update cache
      this.cache.set(url, {
        timestamp: Date.now(),
        data: articles,
      });

      return articles;
    } catch (error) {
      console.error(`[NEWS] Error fetching ${url}:`, error.message);
      return [];
    }
  }

  /**
   * Get news articles with filters and pagination
   * @param {Object} options
   * @param {string} options.sport - Sport filter (football, nba, mlb, tennis, esports, all)
   * @param {string} options.source - Source filter (ESPN, BBC Sport, etc.)
   * @param {string} options.search - Search query
   * @param {number} options.page - Page number (1-based)
   * @param {number} options.limit - Articles per page
   */
  async getNews({ sport = "all", source = null, search = null, page = 1, limit = 10 } = {}) {
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

      // Calculate pagination
      const totalArticles = allArticles.length;
      const totalPages = Math.ceil(totalArticles / limit);
      const offset = (page - 1) * limit;
      const hasMore = page < totalPages;

      // Apply pagination
      const paginatedArticles = allArticles.slice(offset, offset + limit);

      // Fetch OG images for articles without images (with concurrency limit)
      if (OG_CONFIG.enabled) {
        await this.fetchOgImagesWithConcurrency(paginatedArticles);
      }

      // Apply fallback images for articles that still don't have images
      const articlesWithImages = paginatedArticles.map((a) => ({
        ...a,
        imageUrl: a.imageUrl || SPORT_FALLBACK_IMAGES[a.sport] || SPORT_FALLBACK_IMAGES.default,
      }));

      return {
        success: true,
        articles: articlesWithImages,
        total: totalArticles,
        totalPages,
        hasMore,
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
   * Get available sources for a specific sport or all sports
   * @param {string|null} sport - Sport filter (null or 'all' returns all sources)
   * @returns {string[]} - Array of source names
   */
  getSources(sport = null) {
    const sources = new Set();
    
    if (!sport || sport.toLowerCase() === "all") {
      // Return all sources from all sports (excluding esports disciplines)
      for (const [sportKey, feeds] of Object.entries(RSS_FEEDS)) {
        if (sportKey === "esports") continue;
        for (const feed of feeds) {
          sources.add(feed.name);
        }
      }
    } else {
      // Return sources for specific sport
      const sportLower = sport.toLowerCase();
      const feeds = RSS_FEEDS[sportLower];
      
      if (feeds) {
        for (const feed of feeds) {
          sources.add(feed.name);
        }
      }
    }
    
    return Array.from(sources).sort();
  }

  /**
   * Get available sports with their source counts
   * @returns {Object[]} - Array of sport objects with name and source count
   */
  getSports() {
    return Object.keys(RSS_FEEDS).sort().map(sport => ({
      id: sport,
      sources: RSS_FEEDS[sport].length,
      sourceNames: RSS_FEEDS[sport].map(f => f.name),
    }));
  }

  /**
   * Get sources grouped by sport
   * @returns {Object} - Object with sport keys and source arrays
   */
  getSourcesBySport() {
    const result = {};
    for (const [sport, feeds] of Object.entries(RSS_FEEDS)) {
      result[sport] = feeds.map(f => f.name);
    }
    return result;
  }
}

export const newsService = new NewsService();
