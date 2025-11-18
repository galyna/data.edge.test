export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  image: string;
  source: string;
  author?: string;
  publishedAt: string;
  sport: string;
  category: string;
  isBreaking?: boolean;
  url: string;
}

export const mockNews: NewsArticle[] = [
  {
    id: "1",
    title: "Arsenal Secure Dramatic Victory Over Chelsea in Premier League Clash",
    description:
      "Arsenal came from behind to beat Chelsea 2-1 in a thrilling encounter at Emirates Stadium, with late goals securing three crucial points.",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80",
    source: "ESPN",
    author: "John Smith",
    publishedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    sport: "Football",
    category: "Match Report",
    isBreaking: true,
    url: "#",
  },
  {
    id: "2",
    title: "Lakers Star Reveals Training Secrets Ahead of Playoffs",
    description:
      "In an exclusive interview, the Lakers' superstar discusses his preparation regimen and what it takes to perform at the highest level.",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
    source: "The Athletic",
    author: "Sarah Johnson",
    publishedAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    sport: "NBA",
    category: "Interview",
    url: "#",
  },
  {
    id: "3",
    title: "Real Madrid vs Barcelona: El Clásico Preview and Tactical Analysis",
    description:
      "Everything you need to know about tonight's massive showdown, including predicted lineups, key battles, and historical context.",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    source: "Sky Sports",
    author: "Michael Davies",
    publishedAt: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
    sport: "Football",
    category: "Preview",
    url: "#",
  },
  {
    id: "4",
    title: "Djokovic Advances to Semi-Finals After Epic Five-Set Battle",
    description:
      "The Serbian champion showed incredible resilience to overcome his opponent in a match lasting over four hours.",
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
    source: "BBC Sport",
    author: "Emma Wilson",
    publishedAt: new Date(Date.now() - 5 * 60 * 60000).toISOString(),
    sport: "Tennis",
    category: "Match Report",
    url: "#",
  },
  {
    id: "5",
    title: "Yankees Trade Deadline Moves: Breaking Down the Acquisitions",
    description:
      "Analyzing the impact of the Yankees' recent trades and how they strengthen the roster for the playoff push.",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80",
    source: "ESPN",
    author: "David Martinez",
    publishedAt: new Date(Date.now() - 6 * 60 * 60000).toISOString(),
    sport: "MLB",
    category: "Analysis",
    url: "#",
  },
  {
    id: "6",
    title: "G2 Esports Dominate Opening Week of LEC Spring Split",
    description:
      "The defending champions continue their impressive form with a perfect 3-0 start to the season.",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    source: "ESPN Esports",
    author: "Alex Chen",
    publishedAt: new Date(Date.now() - 8 * 60 * 60000).toISOString(),
    sport: "E-sports",
    category: "Match Report",
    isBreaking: false,
    url: "#",
  },
  {
    id: "7",
    title: "Bayern Munich Manager Discusses Tactical Evolution This Season",
    description:
      "An in-depth look at how Bayern have adapted their playing style and what it means for their title challenge.",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80",
    source: "The Athletic",
    author: "Thomas Mueller",
    publishedAt: new Date(Date.now() - 10 * 60 * 60000).toISOString(),
    sport: "Football",
    category: "Tactical Analysis",
    url: "#",
  },
  {
    id: "8",
    title: "NBA Draft Prospects: Top 10 Players to Watch This Season",
    description:
      "Scouting reports and projections for the most exciting prospects in college basketball ahead of the upcoming draft.",
    image: "https://images.unsplash.com/photo-1515523110800-9415d13b84a8?w=800&q=80",
    source: "ESPN",
    author: "Chris Roberts",
    publishedAt: new Date(Date.now() - 12 * 60 * 60000).toISOString(),
    sport: "NBA",
    category: "Draft",
    url: "#",
  },
];

