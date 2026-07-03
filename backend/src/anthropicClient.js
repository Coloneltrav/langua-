import Anthropic from '@anthropic-ai/sdk';
import { env } from './env.js';

// The SDK resolves ANTHROPIC_API_KEY from the environment automatically;
// we only pass it explicitly when set so `ant auth login` profiles still
// work in local dev without an env var.
export const anthropic = new Anthropic(env.anthropicApiKey ? { apiKey: env.anthropicApiKey } : {});
