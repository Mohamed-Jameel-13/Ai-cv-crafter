import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Search, Star, CheckCircle, Eye, X } from "lucide-react";
import { Link } from "react-router-dom";
import {
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  getFeaturedTemplates,
} from "@/data/templates";

const TemplateGallery = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [flippedCards, setFlippedCards] = useState(new Set());
  const navigate = useNavigate();

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    let templates = TEMPLATES;

    // Filter by category
    if (selectedCategory !== "all") {
      templates = templates.filter(
        (template) => template.category === selectedCategory,
      );
    }

    // Filter by search term
    if (searchTerm) {
      templates = templates.filter(
        (template) =>
          template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          template.category.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return templates.sort((a, b) => a.priority - b.priority);
  }, [searchTerm, selectedCategory]);

  const featuredTemplates = getFeaturedTemplates();

  const categoryStats = useMemo(() => {
    const stats = { all: TEMPLATES.length };
    Object.values(TEMPLATE_CATEGORIES).forEach((category) => {
      stats[category] = TEMPLATES.filter((t) => t.category === category).length;
    });
    return stats;
  }, []);

  const handleTemplateSelect = (templateId) => {
    navigate(`/create/templates/${templateId}`);
  };

  const handleCardFlip = (templateId) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(templateId)) {
        newSet.delete(templateId);
      } else {
        newSet.add(templateId);
      }
      return newSet;
    });
  };

  const categories = [
    { key: "all", label: "All Templates", icon: "📄" },
    {
      key: TEMPLATE_CATEGORIES.PROFESSIONAL,
      label: "Professional",
      icon: "💼",
    },
  ];

  const TemplateCard = ({ template, featured = false }) => {
    const getCategoryColors = (category) => {
      // Since we only have professional templates, use consistent blue theme
      return {
        bg: "bg-blue-50 border-blue-200",
        text: "text-blue-800",
        badge: "bg-blue-100 text-blue-800",
      };
    };

    const colors = getCategoryColors(template.category);
    const isFlipped = flippedCards.has(template.id);

    return (
      <div className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl relative h-full perspective-1000">
        {/* Card Container with Flip */}
        <div
          className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}
        >
          {/* Front Side */}
          <Card className="absolute inset-0 backface-hidden border-2 hover:border-[rgb(63,39,34)] bg-white shadow-lg overflow-hidden">
            {/* Featured Badge */}
            {featured && (
              <div className="absolute top-3 right-3 z-10">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </div>
              </div>
            )}

            {/* Template Preview */}
            <div
              className={`relative h-48 ${colors.bg} overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:opacity-90`}
            >
              {template.previewImage ? (
                <div className="w-full h-full p-4 flex items-center justify-center">
                  <img
                    src={template.previewImage}
                    alt={`${template.name} preview`}
                    className="max-w-full max-h-full object-contain rounded shadow-lg border border-slate-200 bg-white"
                  />
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-20 bg-white rounded shadow-lg mb-3 mx-auto flex items-center justify-center border border-slate-200">
                    <div className="text-2xl">📄</div>
                  </div>
                  <p className={`text-sm font-medium ${colors.text}`}>
                    {template.name}
                  </p>
                </div>
              )}

              {/* Hover Overlay with Buttons */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 gap-3">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTemplateSelect(template.id);
                  }}
                  className="text-white shadow-lg transform scale-95 group-hover:scale-100 transition-transform duration-300"
                  style={{
                    backgroundColor: "rgb(63,39,34)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "rgb(53,29,24)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "rgb(63,39,34)";
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Select Template
                </Button>

                {template.previewImage && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardFlip(template.id);
                    }}
                    variant="outline"
                    className="bg-white text-slate-900 border-white hover:bg-slate-100 hover:border-[rgb(63,39,34)] shadow-lg transform scale-95 group-hover:scale-100 transition-transform duration-300"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                )}
              </div>
            </div>

            {/* Template Info */}
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-900">
                  {template.name}
                </CardTitle>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}
                >
                  {template.category}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-slate-600 mb-4">
                {template.description}
              </CardDescription>
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                  ATS-Friendly
                </span>
                <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-full">
                  AI-Powered
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Back Side - Full Resume Preview */}
          <Card className="absolute inset-0 backface-hidden rotate-y-180 border-2 border-blue-500 bg-white shadow-xl overflow-hidden">
            {/* Close Button */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleCardFlip(template.id);
              }}
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 rounded-full p-2 shadow-md"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Full Preview Image */}
            {template.previewImage ? (
              <div className="w-full h-full p-2 flex flex-col">
                <div className="flex-1 flex items-center justify-center bg-slate-50 rounded overflow-hidden">
                  <img
                    src={template.previewImage}
                    alt={`${template.name} full preview`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                {/* Action Buttons at Bottom */}
                <div className="mt-2 flex gap-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTemplateSelect(template.id);
                    }}
                    className="flex-1 text-white text-sm py-2"
                    style={{
                      backgroundColor: "rgb(63,39,34)",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "rgb(53,29,24)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "rgb(63,39,34)";
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Use Template
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-500">No preview available</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/create">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 backdrop-blur-sm border-slate-300 hover:border-[rgb(63,39,34)] text-slate-700 hover:bg-white hover:text-slate-900 shadow-md"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Choose Your Resume Template
              </h1>
              <p className="text-slate-600 text-sm sm:text-base">
                The iconic Jake's Resume template - experience-first, clean, and
                ATS-optimized
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 sm:mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm border-slate-300 text-slate-900"
              onFocus={(e) => {
                e.target.style.borderColor = "rgb(63,39,34)";
                e.target.style.boxShadow = "0 0 0 3px rgba(63,39,34,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "";
                e.target.style.boxShadow = "";
              }}
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.key}
                variant={
                  selectedCategory === category.key ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategory(category.key)}
                className={`flex items-center space-x-2 ${
                  selectedCategory === category.key
                    ? "text-white shadow-md"
                    : "bg-white/80 backdrop-blur-sm border-slate-300 hover:border-[rgb(63,39,34)] text-slate-700 hover:bg-white hover:text-slate-900"
                }`}
                style={
                  selectedCategory === category.key
                    ? {
                        backgroundColor: "rgb(63,39,34)",
                      }
                    : {}
                }
                onMouseEnter={(e) => {
                  if (selectedCategory === category.key) {
                    e.target.style.backgroundColor = "rgb(53,29,24)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory === category.key) {
                    e.target.style.backgroundColor = "rgb(63,39,34)";
                  }
                }}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    selectedCategory === category.key
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {categoryStats[category.key]}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Templates Section */}
        {selectedCategory === "all" && !searchTerm && (
          <div className="mb-10 sm:mb-12">
            <div className="flex items-center space-x-2 mb-4 sm:mb-6">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
                Featured Templates
              </h2>
              <p className="text-slate-600 text-sm">Most popular choices</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {featuredTemplates.slice(0, 6).map((template) => (
                <div key={template.id} className="h-96">
                  <TemplateCard template={template} featured={true} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Templates Section */}
        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
              {selectedCategory === "all"
                ? "All Templates"
                : categories.find((c) => c.key === selectedCategory)?.label +
                  " Templates"}
            </h2>
            <span className="text-sm text-slate-500">
              {filteredTemplates.length} template
              {filteredTemplates.length !== 1 ? "s" : ""} found
            </span>
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No templates found
              </h3>
              <p className="text-slate-500 mb-4">
                Try adjusting your search criteria or category filter
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="text-white"
                style={{
                  backgroundColor: "rgb(63,39,34)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "rgb(53,29,24)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "rgb(63,39,34)";
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="h-96">
                  <TemplateCard
                    template={template}
                    featured={featuredTemplates.some(
                      (f) => f.id === template.id,
                    )}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 sm:p-8 border border-slate-200 shadow-lg">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              Want More Control?
            </h3>
            <p className="text-slate-600 mb-6">
              Use our default resume builder for complete customization and
              step-by-step guidance
            </p>
            <Link to="/create">
              <Button
                variant="outline"
                className="bg-white border-slate-300 hover:border-[rgb(63,39,34)] text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-md"
              >
                Use Default Builder
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery;
