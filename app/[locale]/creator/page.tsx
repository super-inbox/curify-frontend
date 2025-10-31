"use client";

import React, { useState } from 'react';
import { Search, TrendingUp, Heart, DollarSign, Video, Users, Star, MessageSquare, Calendar, Tag, ExternalLink, Play, ThumbsUp, Filter, Plus } from 'lucide-react';

const CurifyMVP = () => {
  const [activePage, setActivePage] = useState('inspiration');
  const [activeTab, setActiveTab] = useState('sparks');
  const [likedItems, setLikedItems] = useState(new Set());

  const toggleLike = (id) => {
    const newLikes = new Set(likedItems);
    if (newLikes.has(id)) {
      newLikes.delete(id);
    } else {
      newLikes.add(id);
    }
    setLikedItems(newLikes);
  };

  // Mock data
  const dailySparks = [
    {
      id: 1,
      title: "Ghibli-Style Dubbing Tutorial",
      description: "Transform any commercial into a Studio Ghibli aesthetic with AI voice cloning",
      thumbnail: "🎨",
      tags: ["#AI_Dubbing", "#Ghibli", "#Tutorial"],
      author: "CreatorStudio",
      views: "24K"
    },
    {
      id: 2,
      title: "Red Bull Ad Goes Anime",
      description: "Behind the scenes: Localizing energy drink commercials with anime vibes",
      thumbnail: "🎬",
      tags: ["#Halloween", "#AI_Dubbing", "#Commercial"],
      author: "LocalizeAI",
      views: "18K"
    },
    {
      id: 3,
      title: "Marvel Mashup Magic",
      description: "Combining superhero franchises in multiple languages for global reach",
      thumbnail: "🦸",
      tags: ["#Marvel_Mashup", "#Multilingual", "#FanContent"],
      author: "SuperLocalize",
      views: "31K"
    }
  ];

  const trendingContent = [
    {
      id: 4,
      title: "Hand-drawn stop motion blows up",
      description: "This creator spent 300 hours on a 60-second masterpiece",
      source: "r/animation",
      upvotes: "12.4K",
      thumbnail: "🎞️",
      link: "#"
    },
    {
      id: 5,
      title: "AI dubbing hack goes viral",
      description: "Thread on translating content while keeping original emotion",
      source: "Twitter/X",
      upvotes: "8.9K",
      thumbnail: "🗣️",
      link: "#"
    },
    {
      id: 6,
      title: "Product placement done right",
      description: "How indie creators monetize without selling out",
      source: "r/ContentCreation",
      upvotes: "6.2K",
      thumbnail: "💰",
      link: "#"
    }
  ];

  const mashupPrompts = [
    {
      id: 'm1',
      prompt: "Kung Fu Panda × Halloween Shopping Haul",
      emoji: "🎃🐼",
      difficulty: "Medium"
    },
    {
      id: 'm2',
      prompt: "Harry Potter as a barista in NYC",
      emoji: "🧙☕",
      difficulty: "Easy"
    },
    {
      id: 'm3',
      prompt: "Pixar characters review tech products",
      emoji: "🤖🎬",
      difficulty: "Hard"
    }
  ];

  const userSubmissions = [
    {
      id: 's1',
      title: "My AI-dubbed K-drama recap",
      creator: "@dramalover",
      upvotes: 847,
      thumbnail: "📺",
      comments: 34
    },
    {
      id: 's2',
      title: "Spanish cooking show meets anime",
      creator: "@cheflocalize",
      upvotes: 1203,
      thumbnail: "👨‍🍳",
      comments: 56
    }
  ];

  const brandOffers = [
    {
      id: 'b1',
      brand: "EcoBottle Co.",
      product: "Sustainable Water Bottles",
      budget: "$500-800",
      deadline: "Nov 15, 2025",
      status: "New",
      category: "Lifestyle"
    },
    {
      id: 'b2',
      brand: "TechGadgets Pro",
      product: "Wireless Earbuds",
      budget: "$1,200-1,500",
      deadline: "Nov 20, 2025",
      status: "Trending",
      category: "Tech"
    },
    {
      id: 'b3',
      brand: "GlowSkin Beauty",
      product: "Korean Skincare Line",
      budget: "$800-1,000",
      deadline: "Dec 1, 2025",
      status: "Hot",
      category: "Beauty"
    }
  ];

  const mySponsorships = [
    {
      id: 'ms1',
      brand: "SnackBox",
      status: "In Progress",
      deliverable: "30s TikTok",
      payment: "$600",
      dueDate: "Nov 8, 2025"
    },
    {
      id: 'ms2',
      brand: "FitGear",
      status: "Completed",
      deliverable: "60s YouTube Review",
      payment: "$1,100",
      paidDate: "Oct 20, 2025"
    }
  ];

  const matchmakerSuggestions = [
    {
      id: 'mm1',
      suggestion: "This toy seller would pair well with @momlifeai",
      brand: "PlayfulToys",
      creator: "@momlifeai",
      match: "95%"
    },
    {
      id: 'mm2',
      suggestion: "@shopspanishstyle has localized skincare videos ready to go",
      brand: "BeautyBrands",
      creator: "@shopspanishstyle",
      match: "88%"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🎬</div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Curify
              </h1>
            </div>
            <nav className="flex space-x-2">
              <button
                onClick={() => setActivePage('inspiration')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activePage === 'inspiration'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-purple-50'
                }`}
              >
                ✨ Inspiration Hub
              </button>
              <button
                onClick={() => setActivePage('monetization')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activePage === 'monetization'
                    ? 'bg-pink-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-pink-50'
                }`}
              >
                💰 Monetization
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activePage === 'inspiration' ? (
          <div>
            {/* Search and Filter Bar */}
            <div className="mb-8 bg-white rounded-xl shadow-sm p-6 border border-purple-100">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search for inspiration, trends, creators..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2">
                  <Filter size={18} />
                  <span>Filters</span>
                </button>
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <TrendingUp size={18} className="text-pink-500" />
                <span className="text-sm font-medium text-gray-700">Trending Tags:</span>
                {['#Halloween', '#AI_Dubbing', '#Marvel_Mashup', '#Tutorial', '#Viral'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 cursor-pointer transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 mb-6 border-b border-gray-200">
              {[
                { id: 'sparks', label: '🗓️ Daily Sparks', icon: Calendar },
                { id: 'trending', label: '🔥 Trending Now', icon: TrendingUp },
                { id: 'mashup', label: '🎨 AI Mashup', icon: Video },
                { id: 'submissions', label: '✍️ User Submissions', icon: Users }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 font-medium transition-all ${
                    activeTab === tab.id
                      ? 'border-b-2 border-purple-600 text-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Sections */}
            {activeTab === 'sparks' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dailySparks.map(spark => (
                  <div key={spark.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-purple-100 overflow-hidden group">
                    <div className="p-6">
                      <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">{spark.thumbnail}</div>
                      <h3 className="font-bold text-lg mb-2 text-gray-800">{spark.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{spark.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {spark.tags.map(tag => (
                          <span key={tag} className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Users size={16} />
                          <span>{spark.author}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Play size={16} />
                          <span>{spark.views}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3">
                      <button className="w-full text-white font-medium hover:opacity-90 transition-opacity">
                        Watch & Learn →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'trending' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trendingContent.map(item => (
                  <div key={item.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-pink-100 p-6">
                    <div className="flex items-start space-x-4">
                      <div className="text-5xl">{item.thumbnail}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 bg-pink-100 text-pink-600 text-xs rounded font-medium">
                            {item.source}
                          </span>
                          <span className="text-gray-500 text-sm flex items-center space-x-1">
                            <ThumbsUp size={14} />
                            <span>{item.upvotes}</span>
                          </span>
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-gray-800">{item.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                        <a href={item.link} className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-1">
                          <span>View Original</span>
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'mashup' && (
              <div>
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 mb-8 text-white">
                  <h2 className="text-3xl font-bold mb-3">🎨 AI Mashup Playground</h2>
                  <p className="text-purple-100">Try these creative prompts and bring them to life with Curify's AI tools!</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {mashupPrompts.map(prompt => (
                    <div key={prompt.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-purple-100 p-6 text-center">
                      <div className="text-6xl mb-4">{prompt.emoji}</div>
                      <h3 className="font-bold text-lg mb-3 text-gray-800">{prompt.prompt}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                        prompt.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        prompt.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {prompt.difficulty}
                      </span>
                      <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                        Start Creating
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Community Creations</h2>
                  <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2">
                    <Plus size={18} />
                    <span>Submit Your Work</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userSubmissions.map(sub => (
                    <div key={sub.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-purple-100 p-6">
                      <div className="flex items-start space-x-4">
                        <div className="text-5xl">{sub.thumbnail}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2 text-gray-800">{sub.title}</h3>
                          <p className="text-sm text-gray-600 mb-4">by {sub.creator}</p>
                          <div className="flex items-center space-x-4">
                            <button className="flex items-center space-x-1 text-purple-600 hover:text-purple-700">
                              <ThumbsUp size={16} />
                              <span className="text-sm font-medium">{sub.upvotes}</span>
                            </button>
                            <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-700">
                              <MessageSquare size={16} />
                              <span className="text-sm font-medium">{sub.comments}</span>
                            </button>
                            <button
                              onClick={() => toggleLike(sub.id)}
                              className={`flex items-center space-x-1 ${
                                likedItems.has(sub.id) ? 'text-pink-600' : 'text-gray-400 hover:text-pink-500'
                              }`}
                            >
                              <Heart size={16} fill={likedItems.has(sub.id) ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Monetization Page */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
                <DollarSign size={32} className="mb-3" />
                <h3 className="text-3xl font-bold mb-1">$2,450</h3>
                <p className="text-purple-200">Total Earnings</p>
              </div>
              <div className="bg-gradient-to-br from-pink-600 to-pink-700 rounded-xl p-6 text-white">
                <Video size={32} className="mb-3" />
                <h3 className="text-3xl font-bold mb-1">12</h3>
                <p className="text-pink-200">Active Campaigns</p>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                <Star size={32} className="mb-3" />
                <h3 className="text-3xl font-bold mb-1">4.8</h3>
                <p className="text-blue-200">Creator Rating</p>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Brand Offers */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-md border border-purple-100 p-6 mb-6">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">💼 Brand Offers</h2>
                  <div className="space-y-4">
                    {brandOffers.map(offer => (
                      <div key={offer.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-bold text-lg text-gray-800">{offer.brand}</h3>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                offer.status === 'Hot' ? 'bg-red-100 text-red-700' :
                                offer.status === 'Trending' ? 'bg-orange-100 text-orange-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {offer.status}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{offer.product}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <DollarSign size={14} />
                                <span>{offer.budget}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Calendar size={14} />
                                <span>Due: {offer.deadline}</span>
                              </span>
                              <span className="px-2 py-1 bg-gray-100 rounded text-xs">{offer.category}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                            Apply Now
                          </button>
                          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Matchmaker Suggestions */}
                <div className="bg-white rounded-xl shadow-md border border-pink-100 p-6">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">🧪 Curify Matchmaker</h2>
                  <div className="space-y-4">
                    {matchmakerSuggestions.map(match => (
                      <div key={match.id} className="border border-pink-200 rounded-lg p-4 bg-pink-50">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-gray-700 font-medium">{match.suggestion}</p>
                          <span className="px-3 py-1 bg-pink-200 text-pink-700 rounded-full text-xs font-bold">
                            {match.match} Match
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4 text-gray-600">
                            <span>Brand: <strong>{match.brand}</strong></span>
                            <span>Creator: <strong>{match.creator}</strong></span>
                          </div>
                          <button className="text-purple-600 hover:text-purple-700 font-medium">
                            Connect →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Wishlist */}
                <div className="bg-white rounded-xl shadow-md border border-purple-100 p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                    <Heart className="text-pink-500" size={20} />
                    <span className="text-gray-800">Wishlist</span>
                  </h3>
                  <div className="space-y-3">
                    {['Tech Gadgets', 'Beauty Brands', 'Eco Products'].map(item => (
                      <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{item}</span>
                        <Heart className="text-pink-500" size={16} fill="currentColor" />
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm">
                    + Add More
                  </button>
                </div>

                {/* My Sponsorships */}
                <div className="bg-white rounded-xl shadow-md border border-purple-100 p-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">📈 My Campaigns</h3>
                  <div className="space-y-3">
                    {mySponsorships.map(sp => (
                      <div key={sp.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-gray-800">{sp.brand}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            sp.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {sp.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{sp.deliverable}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-green-600 font-bold">{sp.payment}</span>
                          <span className="text-gray-500">
                            {sp.status === 'In Progress' ? `Due: ${sp.dueDate}` : `Paid: ${sp.paidDate}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CurifyMVP;