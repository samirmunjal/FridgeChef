import { Router, type IRouter } from "express";
import {
  DetectIngredientsBody,
  SuggestRecipesBody,
  type IngredientDetectionResult,
  type Recipe,
  type RecipeSuggestionResult,
} from "@workspace/api-zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

function getGenAI(apiKey?: string) {
  if (!apiKey) throw new Error("No API key available");
  return new GoogleGenerativeAI(apiKey);
}

const router: IRouter = Router();

// Strip HTML tags for plain-text descriptions
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Infer difficulty from time and steps
function inferDifficulty(readyInMinutes: number, stepCount: number): string {
  if (stepCount <= 3 && readyInMinutes <= 20) return "Easy";
  if (stepCount <= 6 && readyInMinutes <= 45) return "Medium";
  return "Hard";
}

router.post("/recipes/detect-ingredients", async (req, res): Promise<void> => {
  const parsed = DetectIngredientsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const model = getGenAI(parsed.data.apiKey).getGenerativeModel({ model: "gemini-3.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: parsed.data.imageBase64,
        },
      },
      "You are a culinary vision assistant. Look at this photo of a fridge, pantry, or countertop and identify distinct edible ingredients visible in it. Respond ONLY with JSON in the form { \"ingredients\": string[] }. Use short, common ingredient names (e.g. 'Tomatoes', 'Eggs', 'Cheddar Cheese'). List at most 12 ingredients. If nothing edible is visible, return { \"ingredients\": [] }.",
    ]);

    const raw = result.response.text();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const json: unknown = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    const ingredients =
      typeof json === "object" &&
      json !== null &&
      Array.isArray((json as { ingredients?: unknown }).ingredients)
        ? (
            (json as { ingredients: unknown[] }).ingredients.filter(
              (i) => typeof i === "string",
            ) as string[]
          )
        : [];

    const response: IngredientDetectionResult = { ingredients };
    res.json(response);
  } catch (err) {
    req.log.error({ err }, "Failed to detect ingredients");
    const msg = (err as { message?: string }).message || "";
    if (msg.includes("quota") || msg.includes("429")) {
      res.status(429).json({ error: "Your API key quota was exceeded. Please wait a moment or use a different key in Settings." });
      return;
    }
    if (msg.includes("API key not valid")) {
      res.status(401).json({ error: "Invalid API key. Please check your key in Settings." });
      return;
    }
    if (msg.includes("No API key available")) {
      res.status(403).json({ error: "You need a Google AI API key to use FridgeChef. Please add one in Settings." });
      return;
    }
    res.status(502).json({ error: "Failed to analyze the photo. Please try again." });
  }
});

// Spoonacular types
interface SpoonacularSearchResult {
  id: number;
  title: string;
  image?: string;
  usedIngredients: Array<{ name: string }>;
  missedIngredients: Array<{ name: string }>;
}

interface SpoonacularRecipeInfo {
  id: number;
  title: string;
  image?: string;
  readyInMinutes?: number;
  summary?: string;
  cuisines?: string[];
  diets?: string[];
  extendedIngredients?: Array<{ original: string }>;
  analyzedInstructions?: Array<{ steps: Array<{ step: string }> }>;
}

async function fetchSpoonacularRecipes(
  ingredients: string[],
  cuisines: string[],
  diets: string[],
  apiKey: string,
): Promise<Recipe[]> {
  const params = new URLSearchParams();
  params.set("includeIngredients", ingredients.join(","));
  params.set("number", "6");
  params.set("addRecipeInformation", "true");
  params.set("fillIngredients", "true");
  params.set("instructionsRequired", "true");
  params.set("ranking", "1"); // maximize used ingredients
  params.set("apiKey", apiKey);

  if (cuisines.length > 0) {
    params.set("cuisine", cuisines.join(","));
  }

  // Spoonacular "diet" param: vegetarian, vegan, gluten free, dairy free, ketogenic, paleo, etc.
  const spoonacularDiets = ["vegetarian", "vegan", "gluten free", "dairy free", "ketogenic", "paleo", "whole 30", "primal", "pescetarian"];
  const mappedDiets = diets.map((d) => d.toLowerCase().replace(/-/g, " "));
  const validDiets = mappedDiets.filter((d) => spoonacularDiets.includes(d));
  if (validDiets.length > 0) {
    params.set("diet", validDiets.join(","));
  }

  // Spoonacular "intolerances" param for allergies
  const intolerances: string[] = [];
  if (mappedDiets.includes("nuts free")) {
    intolerances.push("tree nut");
  }
  if (intolerances.length > 0) {
    params.set("intolerances", intolerances.join(","));
  }

  const searchResp = await fetch(
    `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`,
  );
  if (!searchResp.ok) {
    const body = await searchResp.text();
    throw new Error(`Spoonacular search failed: ${searchResp.status} ${body}`);
  }

  const searchData = (await searchResp.json()) as {
    results: SpoonacularSearchResult[];
  };

  if (!Array.isArray(searchData.results) || searchData.results.length === 0) {
    return [];
  }

  // For each recipe, fetch full details via the information endpoint
  // This ensures we get complete steps and ingredients
  const recipes: Recipe[] = [];

  for (const summary of searchData.results) {
    try {
      const infoResp = await fetch(
        `https://api.spoonacular.com/recipes/${summary.id}/information?apiKey=${apiKey}`,
      );
      if (!infoResp.ok) continue;

      const info = (await infoResp.json()) as SpoonacularRecipeInfo;
      const steps =
        info.analyzedInstructions && info.analyzedInstructions[0]
          ? info.analyzedInstructions[0].steps.map((s) => s.step)
          : [];

      const allIngredients =
        info.extendedIngredients?.map((ing) => ing.original) ?? [];
      const missed = summary.missedIngredients.map((m) => m.name);
      const used = summary.usedIngredients.map((u) => u.name);
      const total = used.length + missed.length;
      const matchPercent = total > 0 ? Math.round((used.length / total) * 100) : 0;
      const readyInMinutes = info.readyInMinutes ?? 30;

      const recipe: Recipe = {
        id: String(info.id),
        title: info.title,
        time: `${readyInMinutes} min`,
        difficulty: inferDifficulty(readyInMinutes, steps.length),
        matchPercent,
        missingIngredients: missed,
        cuisine: info.cuisines && info.cuisines.length > 0 ? info.cuisines[0] : "Mixed",
        description: info.summary ? stripHtml(info.summary).slice(0, 200) : `${info.title} is a delicious recipe you can make with your ingredients.`,
        ingredients: allIngredients,
        steps,
        imageUrl: info.image || summary.image || undefined,
      };

      recipes.push(recipe);
    } catch {
      // Skip individual recipe failures
    }
  }

  // Sort by matchPercent descending
  recipes.sort((a, b) => (b.matchPercent ?? 0) - (a.matchPercent ?? 0));

  return recipes;
}

router.post("/recipes/suggest", async (req, res): Promise<void> => {
  const parsed = SuggestRecipesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { ingredients, cuisines, diets } = parsed.data;
  const spoonKey = process.env["SPOONACULAR_API_KEY"];

  if (!spoonKey) {
    res.status(503).json({
      error: "Recipe service is temporarily unavailable. Please try again later.",
    });
    return;
  }

  try {
    const recipes = await fetchSpoonacularRecipes(ingredients, cuisines, diets, spoonKey);

    if (recipes.length === 0) {
      res.status(404).json({
        error: "No recipes found for your ingredients. Try adding more items or broadening your cuisine preferences.",
      });
      return;
    }

    const response: RecipeSuggestionResult = { recipes };
    res.json(response);
  } catch (err) {
    req.log.error({ err }, "Failed to suggest recipes via Spoonacular");
    const msg = (err as { message?: string }).message || "";
    if (msg.includes("402") || msg.includes("quota") || msg.includes("limit")) {
      res.status(429).json({
        error: "Recipe search quota exceeded for today. Please try again tomorrow.",
      });
      return;
    }
    if (msg.includes("401") || msg.includes("Invalid API key")) {
      res.status(500).json({
        error: "Recipe service configuration error. Please contact support.",
      });
      return;
    }
    res.status(502).json({
      error: "Failed to fetch recipes. Please try again.",
    });
  }
});

export default router;
