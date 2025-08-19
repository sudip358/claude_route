export interface ProviderConfig {
  apiKey?: string;
  baseURL?: string;
  enabled: boolean;
}

export interface AnyclaudeConfig {
  version: string;
  defaultProvider?: string;
  defaultModel?: string;
  proxyPort?: number;
  providers: {
    openai: ProviderConfig;
    google: ProviderConfig;
    xai: ProviderConfig;
    azure: ProviderConfig;
    anthropic: ProviderConfig;
  };
  claude: {
    dummyApiKey: string;
    note: string;
  };
}

export const DEFAULT_CONFIG: AnyclaudeConfig = {
  version: "1.0.0",
  defaultProvider: "google",
  defaultModel: "google/gemini-2.5-pro",
  proxyPort: 60618,
  providers: {
    openai: {
      baseURL: "https://api.openai.com/v1",
      enabled: false,
    },
    google: {
      baseURL: "https://generativelanguage.googleapis.com/v1beta",
      enabled: false,
    },
    xai: {
      baseURL: "https://api.x.ai/v1",
      enabled: false,
    },
    azure: {
      baseURL: "", // Azure requires custom endpoint
      enabled: false,
    },
    anthropic: {
      baseURL: "https://api.anthropic.com",
      enabled: false,
    },
  },
  claude: {
    dummyApiKey: "sk-ant-api03-dummy_key_for_anyclaude_proxy_12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678",
    note: "This is a fake key required for Claude Code compatibility - NEVER used for actual API calls",
  },
};

export interface ProviderDefaults {
  name: string;
  displayName: string;
  defaultBaseURL: string;
  apiKeyEnv: string;
  baseURLEnv: string;
  description: string;
  requiresCustomEndpoint?: boolean;
}

export const PROVIDER_DEFAULTS: Record<keyof AnyclaudeConfig['providers'], ProviderDefaults> = {
  openai: {
    name: "openai",
    displayName: "OpenAI",
    defaultBaseURL: "https://api.openai.com/v1",
    apiKeyEnv: "OPENAI_API_KEY",
    baseURLEnv: "OPENAI_API_URL",
    description: "OpenAI GPT models (GPT-4, GPT-3.5-turbo, etc.)",
  },
  google: {
    name: "google",
    displayName: "Google",
    defaultBaseURL: "https://generativelanguage.googleapis.com/v1beta",
    apiKeyEnv: "GOOGLE_API_KEY",
    baseURLEnv: "GOOGLE_API_URL",
    description: "Google Gemini models",
  },
  xai: {
    name: "xai",
    displayName: "XAI",
    defaultBaseURL: "https://api.x.ai/v1",
    apiKeyEnv: "XAI_API_KEY",
    baseURLEnv: "XAI_API_URL",
    description: "XAI Grok models",
  },
  azure: {
    name: "azure",
    displayName: "Azure OpenAI",
    defaultBaseURL: "",
    apiKeyEnv: "AZURE_OPENAI_API_KEY",
    baseURLEnv: "AZURE_OPENAI_ENDPOINT",
    description: "Azure OpenAI Service",
    requiresCustomEndpoint: true,
  },
  anthropic: {
    name: "anthropic",
    displayName: "Anthropic",
    defaultBaseURL: "https://api.anthropic.com",
    apiKeyEnv: "ANTHROPIC_API_KEY",
    baseURLEnv: "ANTHROPIC_API_URL",
    description: "Anthropic Claude models (usually not needed with anyclaude)",
  },
};