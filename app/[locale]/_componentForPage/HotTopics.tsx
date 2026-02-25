"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getHotTopics, getTopCategories, HotTopic } from "@/utils/hotTopics";
import { TrendingUp, Users, Layers, Star } from "lucide-react";

export default function HotTopics() {
  const [hotTopics, setHotTopics] = useState<HotTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDimension, setSelectedDimension] = useState<'overall' | 'engagement' | 'category' | 'diversity'>('overall');

  useEffect(() => {
    const loadHotTopics = async () => {
      try {
        const topics = getHotTopics(8);
        setHotTopics(topics);
      } catch (error) {
        console.error("Failed to load hot topics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHotTopics();
  }, []);

  const getSortedTopics = () => {
    const sorted = [...hotTopics];
    switch (selectedDimension) {
      case 'engagement':
        return sorted.sort((a, b) => b.engagementScore - a.engagementScore);
      case 'category':
        return sorted.sort((a, b) => b.categoryScore - a.categoryScore);
      case 'diversity':
        return sorted.sort((a, b) => b.diversityScore - a.diversityScore);
      default:
        return sorted.sort((a, b) => b.score - a.score);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-gray-600";
  };

  const getScoreIcon = (dimension: string) => {
    switch (dimension) {
      case 'engagement':
        return <Users className="h-4 w-4" />;
      case 'category':
        return <TrendingUp className="h-4 w-4" />;
      case 'diversity':
        return <Layers className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          Hot Topics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="w-full h-32 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const sortedTopics = getSortedTopics();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          Hot Topics
        </h3>
        
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedDimension('overall')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              selectedDimension === 'overall'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Overall
          </button>
          <button
            onClick={() => setSelectedDimension('engagement')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              selectedDimension === 'engagement'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Engagement
          </button>
          <button
            onClick={() => setSelectedDimension('category')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              selectedDimension === 'category'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Popular
          </button>
          <button
            onClick={() => setSelectedDimension('diversity')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              selectedDimension === 'diversity'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Diverse
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedTopics.map((topic) => (
          <div
            key={topic.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white"
            onClick={() => window.open(topic.sourceUrl, '_blank')}
          >
            <div className="relative w-full h-32 bg-gray-100">
              <Image
                src={topic.imageUrl}
                alt={topic.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              
              {/* Score badge */}
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                {getScoreIcon(selectedDimension)}
                <span className={`text-xs font-bold ${getScoreColor(
                  selectedDimension === 'engagement' ? topic.engagementScore :
                  selectedDimension === 'category' ? topic.categoryScore :
                  selectedDimension === 'diversity' ? topic.diversityScore :
                  topic.score
                )}`}>
                  {Math.round(
                    selectedDimension === 'engagement' ? topic.engagementScore :
                    selectedDimension === 'category' ? topic.categoryScore :
                    selectedDimension === 'diversity' ? topic.diversityScore :
                    topic.score
                  )}
                </span>
              </div>
            </div>

            <div className="p-3">
              <h4 className="font-semibold text-sm mb-1 line-clamp-2">{topic.title}</h4>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{topic.description}</p>
              
              <div className="flex items-center justify-between text-xs">
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                  {topic.category}
                </span>
                <span className="text-gray-500">
                  {topic.domainCategory}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hotTopics.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No hot topics available at the moment.</p>
        </div>
      )}
    </div>
  );
}
