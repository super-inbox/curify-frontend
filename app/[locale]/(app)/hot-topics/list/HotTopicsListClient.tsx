"use client";

import { useState, useEffect } from "react";
import { getHotArticles, getMediumArticles, getTrendingTopics, getRSSStatistics, RSSArticle } from "@/utils/rssData";
import { TrendingUp, ExternalLink, Clock, Globe, Search, Filter } from "lucide-react";

export default function HotTopicsListClient() {
  const [hotArticles, setHotArticles] = useState<RSSArticle[]>([]);
  const [mediumArticles, setMediumArticles] = useState<RSSArticle[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const hot = getHotArticles(50);
        const medium = getMediumArticles(50);
        const trending = getTrendingTopics();
        const stats = getRSSStatistics();
        
        setHotArticles(hot);
        setMediumArticles(medium);
        setTrendingTopics(trending);
        setStatistics(stats);
      } catch (error) {
        console.error("Failed to load RSS data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getFilteredArticles = () => {
    let articles = [...hotArticles, ...mediumArticles];

    // Filter by search term
    if (searchTerm) {
      articles = articles.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by priority
    if (selectedPriority !== 'all') {
      articles = articles.filter(article => 
        selectedPriority === 'hot' ? article.priority === '🔥 HOT' :
        selectedPriority === 'medium' ? article.priority === '🟡 Medium' :
        article.priority === '⚪ Archive'
      );
    }

    // Sort by final score
    return articles.sort((a, b) => b.scores.final_score - a.scores.final_score);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '🔥 HOT':
        return "bg-red-100 text-red-800";
      case '🟡 Medium':
        return "bg-yellow-100 text-yellow-800";
      case '⚪ Archive':
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.0) return "text-green-600 font-semibold";
    if (score >= 3.0) return "text-yellow-600 font-semibold";
    if (score >= 2.0) return "text-orange-600";
    return "text-gray-600";
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getSourceName = (source: string) => {
    try {
      const url = new URL(source);
      return url.hostname.replace('www.', '');
    } catch {
      return source;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 pt-20 py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-8 w-1/3"></div>
          <div className="space-y-4">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredArticles = getFilteredArticles();

  return (
    <div className="max-w-4xl mx-auto px-6 pt-20 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-orange-500" />
          Hot Topics List
        </h1>
        <p className="text-gray-600 mb-6">
          Simple list view of trending content with AI-powered scoring
        </p>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-2xl font-bold text-red-700">{statistics.hotCount}</div>
            <div className="text-sm text-red-600">Hot Topics</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <div className="text-2xl mb-1">🟡</div>
            <div className="text-2xl font-bold text-yellow-700">{statistics.mediumCount}</div>
            <div className="text-sm text-yellow-600">Medium Topics</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{statistics.avgScores.final_score.toFixed(1)}</div>
            <div className="text-sm text-blue-600">Avg Score</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-green-700">{formatDate(statistics.processedAt)}</div>
            <div className="text-sm text-green-600">Last Updated</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="hot">🔥 Hot Only</option>
              <option value="medium">🟡 Medium Only</option>
              <option value="archive">⚪ Archive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredArticles.length} topics
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {filteredArticles.map((article, index) => (
          <div
            key={`${article.link}-${index}`}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(article.priority)}`}>
                  {article.priority}
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {article.scores.final_score.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Globe className="h-4 w-4" />
                {getSourceName(article.source)}
                <Clock className="h-4 w-4 ml-2" />
                {formatDate(article.published)}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold mb-3">
              <a 
                href={article.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-900 hover:text-blue-700 transition-colors"
              >
                {article.title}
              </a>
            </h3>

            {/* Scores Bar */}
            <div className="flex items-center gap-6 mb-3 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-gray-600">Overall:</span>
                <span className={getScoreColor(article.scores.final_score)}>
                  {article.scores.final_score.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-600">Relevance:</span>
                <span className={getScoreColor(article.scores.relevance)}>
                  {article.scores.relevance.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-600">Visual:</span>
                <span className={getScoreColor(article.scores.visual_potential)}>
                  {article.scores.visual_potential.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-600">Trending:</span>
                <span className={getScoreColor(article.scores.trend_velocity)}>
                  {article.scores.trend_velocity.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-600">Shareable:</span>
                <span className={getScoreColor(article.scores.shareability)}>
                  {article.scores.shareability.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Visual Suggestions */}
            {article.visual_suggestions && article.visual_suggestions.length > 0 && (
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-700 mb-2">💡 Visual Ideas:</div>
                <div className="flex flex-wrap gap-2">
                  {article.visual_suggestions.slice(0, 3).map((suggestion, idx) => (
                    <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      {suggestion}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Read More Link */}
            <div className="pt-3 border-t border-gray-100">
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Read full article
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No topics found matching your filters.</p>
        </div>
      )}

      {/* Trending Topics Footer */}
      {trendingTopics.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Top Trending Topics This Week
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {trendingTopics.slice(0, 10).map((topic, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span className="text-orange-500 font-bold">#{index + 1}</span>
                <span className="text-gray-700">{topic}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
