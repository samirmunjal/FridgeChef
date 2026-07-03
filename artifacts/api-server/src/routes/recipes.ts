import { Router, type IRouter } from "express";
import {
  DetectIngredientsBody,
  SuggestRecipesBody,
  type IngredientDetectionResult,
  type Recipe,
  type RecipeSuggestionResult,
} from "@workspace/api-zod";
import { openai } from "../lib/openai";

const router: IRouter = Router();

router.post("/recipes/detect-ingredients", async (req, res): Promise<void> => {
  const parsed = DetectIngredientsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a culinary vision assistant. Look at the photo of a fridge, pantry, or countertop and identify distinct edible ingredients visible in it. Respond ONLY with JSON in the form { \"ingredients\": string[] }. Use short, common ingredient names (e.g. 'Tomatoes', 'Eggs', 'Cheddar Cheese'). List at most 12 ingredients. If nothing edible is visible, return an empty array.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Identify the ingredients visible in this photo.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${parsed.data.imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const json: unknown = JSON.parse(raw);
    const ingredients =
      typeof json === "object" && json !== null && Array.isArray((json as { ingredients?: unknown }).ingredients)
        ? ((json as { ingredients: unknown[] }).ingredients.filter((i) => typeof i === "string") as string[])
        : [];

    const result: IngredientDetectionResult = { ingredients };
    res.json(result);
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
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a recipe recommendation engine. Given a list of ingredients someone has on hand, plus their cuisine and dietary preferences, suggest 4-6 realistic recipes they could cook. Prefer recipes that use mostly the given ingredients, but it's fine to include 1-3 missing ingredients per recipe if the recipe is a strong match. Respect dietary restrictions strictly (e.g. never suggest meat for 'Vegetarian' or 'Vegan'). Respond ONLY with JSON in the form { \"recipes\": [{ \"id\": string, \"title\": string, \"time\": string (e.g. '25 min'), \"difficulty\": string ('Easy'|'Medium'|'Hard'), \"matchPercent\": integer (0-100, 100 means every ingredient is on hand), \"missingIngredients\": string[], \"cuisine\": string, \"description\": string (one sentence, appetizing) }] }. Sort recipes by matchPercent descending.",
        },
        {
          role: "user",
          content: `Ingredients on hand: ${ingredients.join(", ") || "none specified"}.\nCuisine preference: ${cuisines.join(", ") || "any"}.\nDietary restrictions: ${diets.join(", ") || "none"}.`,
        },
      ],
      max_tokens: 1500,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const json: unknown = JSON.parse(raw);
    const recipes = (Array.isArray((json as { recipes?: unknown }).recipes)
      ? (json as { recipes: unknown[] }).recipes
      : []) as Recipe[];

    const result: RecipeSuggestionResult = { recipes };
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to suggest recipes");
    res.status(502).json({ error: "Failed to generate recipes. Please try again." });
  }
});

export default router;
