import scoredData from '../app/[locale]/(app)/hot-topics/output_scores.json';

export interface RSSArticle {
  title: string;
  link: string;
  source: string;
  published: string;
  scores: {
    relevance: number;
    visual_potential: number;
    trend_velocity: number;
    shareability: number;
    final_score: number;
  };
  priority: string;
  visual_suggestions: string[];
}

export interface RSSMetadata {
  processed_at: string;
  total_articles: number;
  processing_errors: string[];
}

export interface RSSData {
  metadata: RSSMetadata;
  articles: RSSArticle[];
  trending_topics: string[];
}

// Get hot articles from RSS data
export function getHotArticles(limit: number = 20): RSSArticle[] {
  const articles = (scoredData as RSSData).articles || [];
  return articles
    .filter(article => article.priority === '🔥 HOT')
    .sort((a, b) => b.scores.final_score - a.scores.final_score)
    .slice(0, limit);
}

// Get medium priority articles
export function getMediumArticles(limit: number = 20): RSSArticle[] {
  const articles = (scoredData as RSSData).articles || [];
  return articles
    .filter(article => article.priority === '🟡 Medium')
    .sort((a, b) => b.scores.final_score - a.scores.final_score)
    .slice(0, limit);
}

// Get articles by score dimension
export function getArticlesByDimension(dimension: keyof RSSArticle['scores'], limit: number = 20): RSSArticle[] {
  const articles = (scoredData as RSSData).articles || [];
  return articles
    .sort((a, b) => b.scores[dimension] - a.scores[dimension])
    .slice(0, limit);
}

// Get trending topics
export function getTrendingTopics(): string[] {
  const data = scoredData as RSSData;
  return data.trending_topics || [];
}

// Get statistics
export function getRSSStatistics() {
  const data = scoredData as RSSData;
  const articles = data.articles || [];
  
  const hotCount = articles.filter(a => a.priority === '🔥 HOT').length;
  const mediumCount = articles.filter(a => a.priority === '🟡 Medium').length;
  const archiveCount = articles.filter(a => a.priority === '⚪ Archive').length;
  
  const avgScores = articles.reduce((acc, article) => {
    acc.relevance += article.scores.relevance;
    acc.visual_potential += article.scores.visual_potential;
    acc.trend_velocity += article.scores.trend_velocity;
    acc.shareability += article.scores.shareability;
    acc.final_score += article.scores.final_score;
    return acc;
  }, { relevance: 0, visual_potential: 0, trend_velocity: 0, shareability: 0, final_score: 0 });

  const count = articles.length;
  if (count > 0) {
    Object.keys(avgScores).forEach(key => {
      avgScores[key as keyof typeof avgScores] /= count;
    });
  }

  return {
    total: data.metadata.total_articles,
    hotCount,
    mediumCount,
    archiveCount,
    avgScores,
    processedAt: data.metadata.processed_at
  };
}

// Search articles
export function searchArticles(query: string, limit: number = 20): RSSArticle[] {
  const articles = (scoredData as RSSData).articles || [];
  const lowercaseQuery = query.toLowerCase();
  
  return articles
    .filter(article => 
      article.title.toLowerCase().includes(lowercaseQuery) ||
      article.source.toLowerCase().includes(lowercaseQuery)
    )
    .sort((a, b) => b.scores.final_score - a.scores.final_score)
    .slice(0, limit);
}

// Get unique sources
export function getUniqueSources(): string[] {
  const articles = (scoredData as RSSData).articles || [];
  const sources = new Set<string>();
  
  articles.forEach(article => {
    sources.add(article.source);
  });
  
  return Array.from(sources).sort();
}

// Filter by source
export function filterBySource(source: string, limit: number = 20): RSSArticle[] {
  const articles = (scoredData as RSSData).articles || [];
  return articles
    .filter(article => article.source === source)
    .sort((a, b) => b.scores.final_score - a.scores.final_score)
    .slice(0, limit);
}
