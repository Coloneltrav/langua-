import 'dotenv/config';

export const env = {
  port: parseInt(process.env.PORT || '8787', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-opus-4-8',
  azureSpeechKey: process.env.AZURE_SPEECH_KEY || '',
  azureSpeechRegion: process.env.AZURE_SPEECH_REGION || 'westeurope',
  pronunciationAsrUrl: process.env.PRONUNCIATION_ASR_URL || 'http://localhost:8000',
  accessToken: process.env.BLAS_ACCESS_TOKEN || '',
  progressDataFile: process.env.PROGRESS_DATA_FILE || './data/progress.json',
};
