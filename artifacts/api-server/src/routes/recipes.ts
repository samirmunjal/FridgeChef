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

router.post("/recipes/detect-ingredients", async (req, res): Promise<void> => {
  const parsed = DetectIngredientsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const model = getGenAI(parsed.data.apiKey).getGenerativeModel({ model: "gemini-1.5-flash" });

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

router.post("/recipes/suggest", async (req, res): Promise<void> => {
  const parsed = SuggestRecipesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { ingredients, cuisines, diets, apiKey } = parsed.data;

  try {
    const model = getGenAI(apiKey).getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `You are a recipe recommendation engine. Given a list of ingredients someone has on hand, plus their cuisine and dietary preferences, suggest 4-6 realistic recipes they could cook. Prefer recipes that use mostly the given ingredients, but it's fine to include 1-3 missing ingredients per recipe. Respect dietary restrictions strictly (e.g. never suggest meat for 'Vegetarian' or 'Vegan').

For EACH recipe, include:
- id: kebab-case unique ID
- title: appetizing recipe name
- time: cooking time like '25 min'
- difficulty: 'Easy', 'Medium', or 'Hard'
- matchPercent: 0-100 integer (100 means every ingredient is on hand)
- missingIngredients: array of ingredients the user would need to buy
- cuisine: the cuisine style
- description: one appetizing sentence describing the dish
- ingredients: FULL list of ALL ingredients needed for the recipe (including what the user already has), with approximate quantities (e.g. '2 eggs', '1/2 cup flour')
- steps: array of 3-8 step-by-step cooking instructions, each as a clear sentence (e.g. 'Preheat oven to 400°F.', 'Dice tomatoes and set aside.', 'Sauté onions in olive oil until translucent.')

Respond ONLY with JSON in the form:
{ "recipes": [{ "id": string, "title": string, "time": string, "difficulty": string, "matchPercent": integer, "missingIngredients": string[], "cuisine": string, "description": string, "ingredients": string[], "steps": string[] }] }

Sort recipes by matchPercent descending.

Ingredients on hand: ${ingredients.join(", ") || "none specified"}.
Cuisine preference: ${cuisines.join(", ") || "any"}.
Dietary restrictions: ${diets.join(", ") || "none"}.`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const json: unknown = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    const recipes = (
      Array.isArray((json as { recipes?: unknown }).recipes)
        ? (json as { recipes: unknown[] }).recipes
        : []
    ) as Recipe[];

    const response: RecipeSuggestionResult = { recipes };
    res.json(response);
  } catch (err) {
    req.log.error({ err }, "Failed to suggest recipes");
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
    res.status(502).json({ error: "Failed to generate recipes. Please try again." });
  }
});

export default router;
