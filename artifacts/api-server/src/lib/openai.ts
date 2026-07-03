import OpenAI from "openai";

const apiKey = process.env["OPENAI_API_KEY"];

if (!apiKey) {
  throw new Error("OPENAI_API_KEY environment variable is required but was not provided.");
}

export const openai = new OpenAI({ apiKey });
