"use client";

import { useState, useEffect } from "react";
import { getHotArticles, getMediumArticles, getArticlesByDimension, getTrendingTopics, getRSSStatistics, searchArticles, getUniqueSources, filterBySource, RSSArticle } from "@/utils/rssData";
import { TrendingUp, Users, Layers, Star, BarChart3, Filter, Search, ExternalLink, Clock, Globe, Target } from "lucide-react";

export default function HotTopicsClientPage() {
  const [hotArticles, setHotArticles] = useState<RSSArticle[]>([]);
  const [mediumArticles, setMediumArticles] = useState<RSSArticle[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDimension, setSelectedDimension] = useState<'final_score' | 'relevance' | 'visual_potential' | 'trend_velocity' | 'shareability'>('final_score');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const hot = getHotArticles(20);
        const medium = getMediumArticles(20);
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

  const getFilteredAndSortedArticles = () => {
    let filtered = [...hotArticles, ...mediumArticles];

    // Filter by search term
    if (searchTerm) {
      filtered = searchArticles(searchTerm, 100);
    }

    // Filter by source
    if (selectedSource !== 'all') {
      filtered = filterBySource(selectedSource, 100);
    }

    // Filter by priority
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(article => 
        selectedPriority === 'hot' ? article.priority === '🔥 HOT' :
        selectedPriority === 'medium' ? article.priority === '🟡 Medium' :
        article.priority === '⚪ Archive'
      );
    }

    // Sort by selected dimension
    const sorted = [...filtered];
    sorted.sort((a, b) => b.scores[selectedDimension] - a.scores[selectedDimension]);
    
    return sorted.slice(0, 20);
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.0) return "text-green-600";
    if (score >= 3.0) return "text-yellow-600";
    if (score >= 2.0) return "text-orange-600";
    return "text-gray-600";
  };

  const getScoreIcon = (dimension: string) => {
    switch (dimension) {
      case 'relevance':
        return <Target className="h-4 w-4" />;
      case 'visual_potential':
        return <Layers className="h-4 w-4" />;
      case 'trend_velocity':
        return <TrendingUp className="h-4 w-4" />;
      case 'shareability':
        return <Users className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '🔥 HOT':
        return "bg-red-50 text-red-700 border-red-200";
      case '🟡 Medium':
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case '⚪ Archive':
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
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
      <div className="max-w-7xl mx-auto px-6 pt-20 py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-8 w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-6 h-32"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="w-full h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredArticles = getFilteredAndSortedArticles();
  const sources = getUniqueSources();

  return (
    <div className="max-w-7xl mx-auto px-6 pt-20 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-orange-500" />
          Hot Topics Analysis
        </h1>
        <p className="text-gray-600 mb-6">
          Discover trending content with AI-powered scoring across relevance, visual potential, trend velocity, and shareability
        </p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl">🔥</div>
              <h3 className="font-semibold text-red-900">Hot Topics</h3>
            </div>
            <div className="text-3xl font-bold text-red-700">{statistics.hotCount}</div>
            <div className="text-sm text-red-600">High priority articles</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl">🟡</div>
              <h3 className="font-semibold text-yellow-900">Medium Topics</h3>
            </div>
            <div className="text-3xl font-bold text-yellow-700">{statistics.mediumCount}</div>
            <div className="text-sm text-yellow-600">Medium priority articles</div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Avg Score</h3>
            </div>
            <div className="text-3xl font-bold text-blue-700">{statistics.avgScores.final_score.toFixed(1)}</div>
            <div className="text-sm text-blue-600">Overall average</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-6 w-6 text-green-600" />
              <h3 className="font-semibold text-green-900">Last Updated</h3>
            </div>
            <div className="text-lg font-bold text-green-700">
              {formatDate(statistics.processedAt)}
            </div>
            <div className="text-sm text-green-600">Data refresh</div>
          </div>
        </div>
      )}

      {/* Trending Topics */}
      {trendingTopics.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Top Trending Topics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {trendingTopics.slice(0, 6).map((topic, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-purple-100">
                <div className="text-sm font-medium text-purple-800 truncate">{topic}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Source Filter */}
          <div className="lg:w-48">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Sources</option>
              {sources.slice(0, 10).map(source => (
                <option key={source} value={source}>{getSourceName(source)}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="lg:w-36">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="hot">🔥 Hot</option>
              <option value="medium">🟡 Medium</option>
              <option value="archive">⚪ Archive</option>
            </select>
          </div>

          {/* Dimension Sort */}
          <div className="flex gap-2">
            {[
              { value: 'final_score', label: 'Overall' },
              { value: 'relevance', label: 'Relevance' },
              { value: 'visual_potential', label: 'Visual' },
              { value: 'trend_velocity', label: 'Trending' },
              { value: 'shareability', label: 'Shareable' }
            ].map(dimension => (
              <button
                key={dimension.value}
                onClick={() => setSelectedDimension(dimension.value as any)}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  selectedDimension === dimension.value
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                {dimension.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredArticles.length} articles
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredArticles.map((article, index) => (
          <div
            key={`${article.link}-${index}`}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(article.priority)}`}>
                  {article.priority}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Globe className="h-3 w-3" />
                  {getSourceName(article.source)}
                </div>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-lg mb-3 line-clamp-2 leading-tight">
                <a 
                  href={article.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-900 transition-colors"
                >
                  {article.title}
                </a>
              </h3>

              {/* Scores */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-3 w-3" />
                    <span className={`text-sm font-bold ${getScoreColor(article.scores.final_score)}`}>
                      {article.scores.final_score.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Overall</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Target className="h-3 w-3" />
                    <span className={`text-sm font-bold ${getScoreColor(article.scores.relevance)}`}>
                      {article.scores.relevance.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Relevance</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Layers className="h-3 w-3" />
                    <span className={`text-sm font-bold ${getScoreColor(article.scores.visual_potential)}`}>
                      {article.scores.visual_potential.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Visual</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span className={`text-sm font-bold ${getScoreColor(article.scores.trend_velocity)}`}>
                      {article.scores.trend_velocity.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Trending</div>
                </div>
              </div>

              {/* Visual Suggestions */}
              {article.visual_suggestions && article.visual_suggestions.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-medium text-gray-700 mb-2">Visual Ideas:</div>
                  <div className="space-y-1">
                    {article.visual_suggestions.slice(0, 2).map((suggestion, idx) => (
                      <div key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded truncate">
                        💡 {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {formatDate(article.published)}
                </div>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  Read more
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No articles found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
