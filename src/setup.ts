import { createInterface } from "readline";
import { configManager } from "./config-manager";
import { PROVIDER_DEFAULTS } from "./config-types";
import type { AnyclaudeConfig, ProviderConfig } from "./config-types";

class SetupPrompt {
  private rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  async question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }

  async confirm(prompt: string, defaultValue = false): Promise<boolean> {
    const defaultStr = defaultValue ? "Y/n" : "y/N";
    const answer = await this.question(`${prompt} (${defaultStr}): `);
    if (!answer.trim()) return defaultValue;
    return answer.toLowerCase().startsWith("y");
  }

  async choice(prompt: string, choices: string[], defaultIndex = 0): Promise<number> {
    console.log(prompt);
    choices.forEach((choice, index) => {
      const marker = index === defaultIndex ? "❯" : " ";
      console.log(`${marker} ${index + 1}. ${choice}`);
    });
    
    while (true) {
      const answer = await this.question("Select (1-" + choices.length + "): ");
      const index = parseInt(answer.trim()) - 1;
      if (index >= 0 && index < choices.length) {
        return index;
      }
      if (!answer.trim()) return defaultIndex;
      console.log("Invalid choice. Please try again.");
    }
  }

  close() {
    this.rl.close();
  }
}

export class AnyclaudeSetup {
  private prompt = new SetupPrompt();

  async run(): Promise<void> {
    try {
      console.log("🚀 Welcome to Anyclaude Setup!\n");

      const configExists = await configManager.configExists();
      if (configExists) {
        const overwrite = await this.prompt.confirm(
          "Configuration already exists. Overwrite it?",
          false
        );
        if (!overwrite) {
          console.log("Setup cancelled.");
          return;
        }
      }

      const config = await configManager.loadConfig();
      
      const setupType = await this.prompt.choice(
        "How would you like to set up claude_route?",
        [
          "Quick setup (configure one provider)",
          "Full setup (configure multiple providers)",
          "Advanced setup (customize all settings)"
        ]
      );

      switch (setupType) {
        case 0:
          await this.quickSetup(config);
          break;
        case 1:
          await this.fullSetup(config);
          break;
        case 2:
          await this.advancedSetup(config);
          break;
      }

      await configManager.saveConfig(config);
      
      console.log("\n✅ Configuration saved successfully!");
      console.log(`📁 Config location: ${configManager.getConfigPath()}`);
      
      const validation = await configManager.validateConfig(config);
      if (!validation.valid) {
        console.log("\n⚠️  Configuration warnings:");
        validation.errors.forEach(error => console.log(`  • ${error}`));
      }

      console.log("\n🎉 Setup complete! You can now use claude_route with:");
      const enabledProviders = Object.entries(config.providers)
        .filter(([, provider]) => provider.enabled)
        .map(([name]) => name);
      
      if (enabledProviders.length > 0) {
        console.log("Examples:");
        enabledProviders.forEach(provider => {
          const example = this.getExampleCommand(provider);
          console.log(`  claude_route start --model ${example}`);
        });
      }
      
    } catch (error) {
      console.error("Setup failed:", error);
      process.exit(1);
    } finally {
      this.prompt.close();
    }
  }

  private async quickSetup(config: AnyclaudeConfig): Promise<void> {
    console.log("\n📋 Quick Setup - Configure one provider\n");
    
    const providerChoices = Object.entries(PROVIDER_DEFAULTS).map(
      ([, defaults]) => `${defaults.displayName} - ${defaults.description}`
    );
    
    const providerIndex = await this.prompt.choice(
      "Select your primary AI provider:",
      providerChoices
    );
    
    const providerName = Object.keys(PROVIDER_DEFAULTS)[providerIndex] as keyof typeof PROVIDER_DEFAULTS;
    await this.configureProvider(config, providerName);
    
    config.defaultProvider = providerName;
    config.defaultModel = `${providerName}/${this.getDefaultModel(providerName)}`;
  }

  private async fullSetup(config: AnyclaudeConfig): Promise<void> {
    console.log("\n📋 Full Setup - Configure multiple providers\n");
    
    for (const [providerName, defaults] of Object.entries(PROVIDER_DEFAULTS)) {
      const configure = await this.prompt.confirm(
        `Configure ${defaults.displayName}?`,
        false
      );
      
      if (configure) {
        await this.configureProvider(config, providerName as keyof typeof PROVIDER_DEFAULTS);
      }
    }
    
    const enabledProviders = Object.entries(config.providers)
      .filter(([, provider]) => provider.enabled)
      .map(([name]) => name);
    
    if (enabledProviders.length > 0) {
      const defaultIndex = await this.prompt.choice(
        "Select default provider:",
        enabledProviders.map(name => PROVIDER_DEFAULTS[name as keyof typeof PROVIDER_DEFAULTS].displayName)
      );
      
      const defaultProvider = enabledProviders[defaultIndex] as keyof typeof PROVIDER_DEFAULTS;
      config.defaultProvider = defaultProvider;
      config.defaultModel = `${defaultProvider}/${this.getDefaultModel(defaultProvider)}`;
    }
  }

  private async advancedSetup(config: AnyclaudeConfig): Promise<void> {
    console.log("\n📋 Advanced Setup - Customize all settings\n");
    
    // Configure proxy port
    const customPort = await this.prompt.question(
      `Proxy port (default: ${config.proxyPort}): `
    );
    if (customPort.trim()) {
      const port = parseInt(customPort.trim());
      if (!isNaN(port) && port > 0 && port < 65536) {
        config.proxyPort = port;
      }
    }
    
    // Configure all providers
    await this.fullSetup(config);
    
    // Configure dummy key
    const customDummyKey = await this.prompt.confirm(
      "Customize dummy Anthropic API key?",
      false
    );
    
    if (customDummyKey) {
      const dummyKey = await this.prompt.question(
        "Enter dummy key (must start with sk-ant-): "
      );
      if (dummyKey.startsWith("sk-ant-")) {
        config.claude.dummyApiKey = dummyKey;
      }
    }
  }

  private async configureProvider(
    config: AnyclaudeConfig,
    providerName: keyof typeof PROVIDER_DEFAULTS
  ): Promise<void> {
    const defaults = PROVIDER_DEFAULTS[providerName];
    console.log(`\n🔧 Configuring ${defaults.displayName}`);
    console.log(`   ${defaults.description}\n`);
    
    // API Key
    const apiKey = await this.prompt.question(
      `${defaults.displayName} API Key${process.env[defaults.apiKeyEnv] ? ' (found in env)' : ''}: `
    );
    
    // Base URL
    let baseURL: string;
    if (defaults.requiresCustomEndpoint) {
      baseURL = await this.prompt.question(
        `${defaults.displayName} Endpoint (required): `
      );
    } else {
      const useCustomURL = await this.prompt.confirm(
        `Use custom base URL? (default: ${defaults.defaultBaseURL})`,
        false
      );
      
      if (useCustomURL) {
        baseURL = await this.prompt.question(
          `Custom base URL (default: ${defaults.defaultBaseURL}): `
        );
        if (!baseURL.trim()) {
          baseURL = defaults.defaultBaseURL;
        }
      } else {
        baseURL = defaults.defaultBaseURL;
      }
    }
    
    const providerConfig: ProviderConfig = {
      apiKey: apiKey.trim() || undefined,
      baseURL: baseURL.trim(),
      enabled: true,
    };
    
    config.providers[providerName] = providerConfig;
    console.log(`✅ ${defaults.displayName} configured`);
  }

  private getDefaultModel(providerName: string): string {
    const models: Record<string, string> = {
      openai: "gpt-4",
      google: "gemini-2.5-pro",
      xai: "grok-beta",
      azure: "gpt-4",
      anthropic: "claude-3-sonnet-20240229",
    };
    return models[providerName] || "default";
  }

  private getExampleCommand(providerName: string): string {
    const examples: Record<string, string> = {
      openai: "openai/gpt-4",
      google: "google/gemini-2.5-pro",
      xai: "xai/grok-beta",
      azure: "azure/gpt-4",
      anthropic: "anthropic/claude-3-sonnet-20240229",
    };
    return examples[providerName] || `${providerName}/default`;
  }
}

// CLI entry point
if (require.main === module) {
  const setup = new AnyclaudeSetup();
  setup.run().catch(console.error);
}