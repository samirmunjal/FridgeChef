import { useState } from "react";
import { AppLayout } from "./_shared/AppLayout";
import { Button } from "../../ui/button";
import { Camera, RefreshCw, Sparkles, Check, ChevronRight } from "lucide-react";
import { Badge } from "../../ui/badge";

export function Capture() {
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleScan = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setScanned(true);
    }, 1500);
  };

  const ingredients = [
    "Tomatoes", "Bell Peppers", "Eggs", "Spinach", "Garlic", "Onions", "Cheddar Cheese"
  ];

  return (
    <AppLayout title="FridgeChef">
      <div className="flex flex-col h-full">
        {!scanned ? (
          <div className="flex-1 flex flex-col p-6">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-serif text-stone-800 tracking-tight leading-tight">What's in the kitchen?</h2>
              <p className="text-stone-500 mt-2">Snap a photo and we'll figure out what you can cook tonight.</p>
            </div>
            
            <div className="flex-1 relative rounded-3xl overflow-hidden shadow-sm border border-stone-200 bg-stone-100 mb-6 group">
              <img 
                src="/__mockup/images/fridge-inside.png" 
                alt="Inside of fridge" 
                className={`w-full h-full object-cover transition-all duration-700 ${loading ? 'scale-105 blur-sm opacity-80' : 'scale-100 opacity-100'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {!loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-white/40 border-dashed rounded-3xl animate-pulse" />
                </div>
              )}

              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm">
                  <Sparkles className="h-10 w-10 text-white animate-spin-slow mb-4" />
                  <p className="text-white font-medium text-lg tracking-wide drop-shadow-md">Scanning ingredients...</p>
                </div>
              )}
            </div>

            <Button 
              onClick={handleScan} 
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-lg font-medium shadow-lg shadow-orange-600/20"
            >
              <Camera className="mr-2 h-5 w-5" />
              {loading ? "Analyzing..." : "Scan Ingredients"}
            </Button>
            <button className="text-stone-500 text-sm font-medium mt-4 hover:text-stone-700 transition-colors">
              Choose a photo instead
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col p-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4 shadow-sm">
                <Check className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-serif text-stone-800 tracking-tight leading-tight">Found 7 items</h2>
              <p className="text-stone-500 mt-2">Here's what we spotted. Add or remove anything we missed.</p>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap gap-2">
                {ingredients.map((item, i) => (
                  <Badge 
                    key={item} 
                    variant="secondary"
                    className="px-4 py-2 text-sm rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-900 border-none shadow-sm animate-in zoom-in-50 fade-in fill-mode-both"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {item}
                  </Badge>
                ))}
                <Badge variant="outline" className="px-4 py-2 text-sm rounded-xl border-dashed border-stone-300 text-stone-500 hover:bg-stone-100 cursor-pointer">
                  + Add ingredient
                </Badge>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Button 
                className="w-full h-14 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-lg font-medium shadow-lg shadow-orange-600/20 group"
              >
                Next: Preferences
                <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                variant="ghost" 
                className="w-full h-14 rounded-2xl text-stone-600 hover:bg-stone-200"
                onClick={() => setScanned(false)}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Rescan
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
