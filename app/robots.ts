import type { MetadataRoute } from "next";
import { ROUTES } from "./lib/sections";

// AI/LLM crawlers that respect robots.txt (training + browsing agents), in addition
// to the wildcard rule below which already covers standard search engine bots.
// Bot names shift over time — cross-check against a maintained list such as
// https://github.com/ai-robots-txt/ai.robots.txt when adding to this array.
const AI_CRAWLER_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "CCBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "PerplexityBot",
  "Amazonbot",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  "cohere-ai",
  "Diffbot",
  "Timpibot",
  "ImagesiftBot",
  "omgili",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [ROUTES.discovery, ROUTES.termsProject],
      },
      {
        userAgent: AI_CRAWLER_USER_AGENTS,
        disallow: "/",
      },
    ],
  };
}
