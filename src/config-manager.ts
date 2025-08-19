import { promises as fs } from "fs";
import { join } from "path";
import { homedir } from "os";
import type { AnyclaudeConfig, ProviderConfig } from "./config-types";
import { DEFAULT_CONFIG, PROVIDER_DEFAULTS } from "./config-types";

export class ConfigManager {
  private configDir: string;
  private configPath: string;

  constructor() {
    this.configDir = join(homedir(), ".claude_route");
    this.configPath = join(this.configDir, "config.json");
  }

  async ensureConfigDir(): Promise<void> {
    try {
      await fs.access(this.configDir);
    } catch {
      await fs.mkdir(this.configDir, { recursive: true });
    }
  }

  async loadConfig(): Promise<AnyclaudeConfig> {
    try {
      await this.ensureConfigDir();
      const configData = await fs.readFile(this.configPath, "utf8");
      const config = JSON.parse(configData) as AnyclaudeConfig;
      
      // Merge with defaults to ensure all properties exist
      return this.mergeWithDefaults(config);
    } catch {
      // If config doesn't exist or is invalid, return defaults
      return { ...DEFAULT_CONFIG };
    }
  }

  async saveConfig(config: AnyclaudeConfig): Promise<void> {
    await this.ensureConfigDir();
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), "utf8");
  }

  private mergeWithDefaults(config: Partial<AnyclaudeConfig>): AnyclaudeConfig {
    return {
      version: config.version || DEFAULT_CONFIG.version,
      defaultProvider: config.defaultProvider || DEFAULT_CONFIG.defaultProvider,
      defaultModel: config.defaultModel || DEFAULT_CONFIG.defaultModel,
      proxyPort: config.proxyPort || DEFAULT_CONFIG.proxyPort,
      providers: {
        openai: { ...DEFAULT_CONFIG.providers.openai, ...config.providers?.openai },
        google: { ...DEFAULT_CONFIG.providers.google, ...config.providers?.google },
        xai: { ...DEFAULT_CONFIG.providers.xai, ...config.providers?.xai },
        azure: { ...DEFAULT_CONFIG.providers.azure, ...config.providers?.azure },
        anthropic: { ...DEFAULT_CONFIG.providers.anthropic, ...config.providers?.anthropic },
      },
      claude: {
        ...DEFAULT_CONFIG.claude,
        ...config.claude,
      },
    };
  }

  async updateProvider(
    providerName: keyof AnyclaudeConfig["providers"],
    providerConfig: Partial<ProviderConfig>
  ): Promise<void> {
    const config = await this.loadConfig();
    config.providers[providerName] = {
      ...config.providers[providerName],
      ...providerConfig,
    };
    await this.saveConfig(config);
  }

  async enableProvider(providerName: keyof AnyclaudeConfig["providers"]): Promise<void> {
    await this.updateProvider(providerName, { enabled: true });
  }

  async disableProvider(providerName: keyof AnyclaudeConfig["providers"]): Promise<void> {
    await this.updateProvider(providerName, { enabled: false });
  }

  async setDefaultProvider(
    providerName: keyof AnyclaudeConfig["providers"],
    modelName?: string
  ): Promise<void> {
    const config = await this.loadConfig();
    config.defaultProvider = providerName;
    if (modelName) {
      config.defaultModel = `${providerName}/${modelName}`;
    }
    await this.saveConfig(config);
  }

  /**
   * Get provider configuration with environment variable fallbacks
   */
  getProviderConfig(
    providerName: keyof AnyclaudeConfig["providers"],
    config: AnyclaudeConfig
  ): ProviderConfig {
    const providerDefaults = PROVIDER_DEFAULTS[providerName];
    const configProvider = config.providers[providerName];
    
    return {
      apiKey: process.env[providerDefaults.apiKeyEnv] || configProvider.apiKey,
      baseURL: process.env[providerDefaults.baseURLEnv] || configProvider.baseURL,
      enabled: configProvider.enabled,
    };
  }

  /**
   * Get all provider configurations with environment variable fallbacks
   */
  getAllProviderConfigs(config: AnyclaudeConfig): Record<string, ProviderConfig> {
    const providers: Record<string, ProviderConfig> = {};
    
    for (const providerName of Object.keys(config.providers) as Array<keyof AnyclaudeConfig["providers"]>) {
      providers[providerName] = this.getProviderConfig(providerName, config);
    }
    
    return providers;
  }

  async configExists(): Promise<boolean> {
    try {
      await fs.access(this.configPath);
      return true;
    } catch {
      return false;
    }
  }

  getConfigPath(): string {
    return this.configPath;
  }

  getConfigDir(): string {
    return this.configDir;
  }

  async deleteConfig(): Promise<void> {
    try {
      await fs.unlink(this.configPath);
    } catch {
      // Config file doesn't exist, nothing to delete
    }
  }

  async validateConfig(config: AnyclaudeConfig): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check version
    if (!config.version) {
      errors.push("Config version is missing");
    }

    // Check providers
    for (const [providerName, providerConfig] of Object.entries(config.providers)) {
      if (providerConfig.enabled) {
        const defaults = PROVIDER_DEFAULTS[providerName as keyof typeof PROVIDER_DEFAULTS];
        
        if (!providerConfig.apiKey && !process.env[defaults.apiKeyEnv]) {
          errors.push(`${defaults.displayName} is enabled but no API key is configured`);
        }

        if (defaults.requiresCustomEndpoint && !providerConfig.baseURL && !process.env[defaults.baseURLEnv]) {
          errors.push(`${defaults.displayName} requires a custom endpoint but none is configured`);
        }
      }
    }

    // Check dummy key format
    if (!config.claude.dummyApiKey.startsWith("sk-ant-")) {
      errors.push("Invalid dummy Anthropic API key format");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const configManager = new ConfigManager();