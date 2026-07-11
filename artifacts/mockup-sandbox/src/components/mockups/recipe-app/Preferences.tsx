import { useState } from "react";
import { AppLayout } from "./_shared/AppLayout";
import { Button } from "../../ui/button";
import { ChevronRight, Filter } from "lucide-react";

const cuisines = [
  "Italian", "Mexican", "Asian", "Mediterranean", "American", "Indian", "Middle Eastern", "Any"
];

const diets = [
  "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nuts-Free", "Low-Carb", "Keto", "Paleo"
];

export function Preferences() {
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(["Any"]);
  const [selectedDiets, setSelectedDiets] = useState<string[]>(["Vegetarian"]);

  const toggleCuisine = (c: string) => {
    if (c === "Any") {
      setSelectedCuisines(["Any"]);
      return;
    }
    const next = selectedCuisines.includes(c) 
      ? selectedCuisines.filter(x => x !== c)
      : [...selectedCuisines.filter(x => x !== "Any"), c];
    setSelectedCuisines(next.length === 0 ? ["Any"] : next);
  };

  const toggleDiet = (d: string) => {
    setSelectedDiets(prev => 
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
  };

  return (
    <AppLayout title="Preferences" showBack>
      <div className="flex flex-col min-h-full p-6 pb-24">
        
        <div className="mb-8">
          <h2 className="text-3xl font-serif text-stone-800 tracking-tight leading-tight">What are you craving?</h2>
          <p className="text-stone-500 mt-2">Filter recipes by cuisine and dietary needs.</p>
        </div>

        <div className="space-y-10 flex-1">
          {/* Cuisines */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-medium text-stone-800">Cuisine</h3>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {cuisines.map((c) => {
                const isSelected = selectedCuisines.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleCuisine(c)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 ${
                      isSelected 
                        ? "bg-orange-600 text-white shadow-md shadow-orange-600/20" 
                        : "bg-white text-stone-600 border border-stone-200 hover:border-orange-300 hover:bg-orange-50"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Diets */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-stone-400" />
              <h3 className="text-lg font-medium text-stone-800">Dietary Restrictions</h3>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {diets.map((d) => {
                const isSelected = selectedDiets.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => toggleDiet(d)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 ${
                      isSelected 
                        ? "bg-stone-800 text-white shadow-md" 
                        : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#FFFBF5] via-[#FFFBF5] to-transparent sm:absolute pb-8">
          <Button 
            className="w-full h-14 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-lg font-medium shadow-lg shadow-orange-600/20 group"
          >
            Find Recipes
            <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

      </div>
    </AppLayout>
  );
}
