import { Router, type IRouter } from "express";
import {
  DetectIngredientsBody,
  SuggestRecipesBody,
  type IngredientDetectionResult,
  type Recipe,
  type RecipeSuggestionResult,
} from "@workspace/api-zod";
import { genAI } from "../lib/gemini";

const router: IRouter = Router();

router.post("/recipes/detect-ingredients", async (req, res): Promise<void> => {
  const parsed = DetectIngredientsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

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
    res.status(502).json({ error: "Failed to analyze the photo. Please try again." });
  }
});

router.post("/recipes/suggest", async (req, res): Promise<void> => {
  const parsed = SuggestRecipesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { ingredients, cuisines, diets } = parsed.data;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `You are a recipe recommendation engine. Given a list of ingredients someone has on hand, plus their cuisine and dietary preferences, suggest 4-6 realistic recipes they could cook. Prefer recipes that use mostly the given ingredients, but it's fine to include 1-3 missing ingredients per recipe. Respect dietary restrictions strictly (e.g. never suggest meat for 'Vegetarian' or 'Vegan'). Respond ONLY with JSON in the form { "recipes": [{ "id": string, "title": string, "time": string (e.g. '25 min'), "difficulty": string ('Easy'|'Medium'|'Hard'), "matchPercent": integer (0-100, 100 means every ingredient is on hand), "missingIngredients": string[], "cuisine": string, "description": string (one sentence, appetizing) }] }. Sort recipes by matchPercent descending.

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
    res.status(502).json({ error: "Failed to generate recipes. Please try again." });
  }
});

export default router;
