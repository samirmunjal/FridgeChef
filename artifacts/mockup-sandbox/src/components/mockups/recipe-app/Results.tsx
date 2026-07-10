import { useState } from "react";
import { AppLayout } from "./_shared/AppLayout";
import { Clock, ChefHat, Heart, Sparkles, ChevronRight, CheckCircle2, Circle } from "lucide-react";

interface Recipe {
  id: string;
  title: string;
  image: string;
  time: string;
  matchText: string;
  perfectMatch: boolean;
  missingTags: string[];
}

const recipes: Recipe[] = [
  {
    id: "1",
    title: "Rustic Tomato Basil Pasta",
    image: "/__mockup/images/recipe-pasta.png",
    time: "25 min",
    matchText: "100% Match",
    perfectMatch: true,
    missingTags: []
  },
  {
    id: "2",
    title: "Vegetarian Street Tacos",
    image: "/__mockup/images/recipe-tacos.png",
    time: "15 min",
    matchText: "Missing 1 item",
    perfectMatch: false,
    missingTags: ["Tortillas"]
  },
  {
    id: "3",
    title: "Creamy Vegetable Curry",
    image: "/__mockup/images/recipe-curry.png",
    time: "35 min",
    matchText: "Missing 2 items",
    perfectMatch: false,
    missingTags: ["Coconut Milk", "Curry Paste"]
  },
  {
    id: "4",
    title: "Summer Garden Salad",
    image: "/__mockup/images/recipe-salad.png",
    time: "10 min",
    matchText: "100% Match",
    perfectMatch: true,
    missingTags: []
  }
];

export function Results() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <AppLayout title="Tonight's Menu" showBack>
      <div className="p-6 pb-20">
        
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Based on your 7 ingredients
          </div>
          <h2 className="text-3xl font-serif text-stone-800 tracking-tight leading-tight">We found 4 perfect matches</h2>
        </div>

        <div className="space-y-5">
          {recipes.map((recipe, i) => {
            const isExpanded = expandedId === recipe.id;
            
            return (
              <div 
                key={recipe.id}
                onClick={() => setExpandedId(isExpanded ? null : recipe.id)}
                className={`bg-white rounded-3xl overflow-hidden shadow-sm border transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-bottom-4 fill-mode-both ${
                  isExpanded ? 'border-orange-300 shadow-md ring-4 ring-orange-50' : 'border-stone-100 hover:border-stone-200'
                }`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={recipe.image} 
                    alt={recipe.title} 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute top-4 right-4">
                    <button className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-stone-400 hover:text-red-500 shadow-sm transition-colors">
                      <Heart className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="absolute top-4 left-4">
                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md flex items-center gap-1.5 ${
                      recipe.perfectMatch ? 'bg-green-500/90 text-white' : 'bg-amber-500/90 text-white'
                    }`}>
                      {recipe.perfectMatch ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                      {recipe.matchText}
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-xl font-medium text-stone-800 mb-2">{recipe.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-stone-500 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {recipe.time}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ChefHat className="h-4 w-4" />
                      Easy
                    </div>
                  </div>

                  {recipe.missingTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs text-stone-400 my-auto">Need:</span>
                      {recipe.missingTags.map(tag => (
                        <a
                          key={tag}
                          href={`https://www.amazon.com/s?k=${encodeURIComponent(tag)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 hover:bg-orange-100 text-stone-600 hover:text-orange-700 text-xs rounded-md transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                          {tag}
                        </a>
                      ))}
                    </div>
                  )}

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-stone-100 animate-in slide-in-from-top-2 fade-in">
                      <button className="w-full h-12 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-900 font-medium flex items-center justify-center transition-colors">
                        View Recipe
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
