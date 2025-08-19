# Anyclaude Setup Guide

This guide shows you how to configure anyclaude with custom API URLs for all providers using the new interactive setup system.

## Quick Start

### Option 1: Interactive Setup
```bash
# Run the interactive setup
bun run setup
# or after global install:
anyclaude-setup
```

### Option 2: Manual Configuration
```bash
# Set environment variables
export OPENAI_API_KEY="your-openai-key"
export OPENAI_API_URL="https://api.openai.com/v1"
export GOOGLE_API_KEY="your-google-key"
export GOOGLE_API_URL="https://vertex.custom-vertex-ai.example.com/v1beta"
export ANTHROPIC_API_KEY="sk-ant-api03-dummy_key_for_anyclaude_proxy_12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678"

# Start anyclaude
bun run src/main.ts --model google/gemini-2.5-pro
```

## Interactive Setup Options

### 1. Quick Setup (Single Provider)
Perfect for getting started quickly with one AI provider.

```
🚀 Welcome to Anyclaude Setup!

How would you like to set up anyclaude?
❯ 1. Quick setup (configure one provider)
  2. Full setup (configure multiple providers)
  3. Advanced setup (customize all settings)

Select your primary AI provider:
❯ 1. Google - Google Gemini models
  2. OpenAI - OpenAI GPT models (GPT-4, GPT-3.5-turbo, etc.)
  3. XAI - XAI Grok models
  4. Azure OpenAI - Azure OpenAI Service
  5. Anthropic - Anthropic Claude models (usually not needed with anyclaude)
```

### 2. Full Setup (Multiple Providers)
Configure multiple providers for maximum flexibility.

```
📋 Full Setup - Configure multiple providers

Configure Google? (y/N): y
🔧 Configuring Google
   Google Gemini models

Google API Key: [your-key]
Use custom base URL? (default: https://generativelanguage.googleapis.com/v1beta) (y/N): y
Custom base URL: https://vertex.custom-vertex-ai.example.com/v1beta
✅ Google configured

Configure OpenAI? (y/N): y
🔧 Configuring OpenAI
   OpenAI GPT models (GPT-4, GPT-3.5-turbo, etc.)

OpenAI API Key: [your-key]
Use custom base URL? (default: https://api.openai.com/v1) (y/N): n
✅ OpenAI configured
```

### 3. Advanced Setup
Full customization including proxy ports and dummy keys.

```
📋 Advanced Setup - Customize all settings

Proxy port (default: 60618): 
Configure providers...
Customize dummy Anthropic API key? (y/N): n
```

## Provider-Specific Configuration

### Google (Gemini)
```bash
🔧 Configuring Google
   Google Gemini models

Google API Key: sk-5da5d32f158c42538345bedf7ba1b76b
Use custom base URL? (default: https://generativelanguage.googleapis.com/v1beta) (y/N): y
Custom base URL (default: https://generativelanguage.googleapis.com/v1beta): https://vertex.custom-vertex-ai.example.com/v1beta
✅ Google configured
```

### OpenAI
```bash
🔧 Configuring OpenAI
   OpenAI GPT models (GPT-4, GPT-3.5-turbo, etc.)

OpenAI API Key: sk-proj-abcd1234...
Use custom base URL? (default: https://api.openai.com/v1) (y/N): y
Custom base URL (default: https://api.openai.com/v1): https://api.custom-openai.com/v1
✅ OpenAI configured
```

### XAI (Grok)
```bash
🔧 Configuring XAI
   XAI Grok models

XAI API Key: xai-12345...
Use custom base URL? (default: https://api.x.ai/v1) (y/N): n
✅ XAI configured
```

### Azure OpenAI
```bash
🔧 Configuring Azure OpenAI
   Azure OpenAI Service

Azure OpenAI API Key: azure-key...
Azure OpenAI Endpoint (required): https://mycompany.openai.azure.com
✅ Azure OpenAI configured
```

### Anthropic
```bash
🔧 Configuring Anthropic
   Anthropic Claude models (usually not needed with anyclaude)

Anthropic API Key: sk-ant-real-key...
Use custom base URL? (default: https://api.anthropic.com) (y/N): n
✅ Anthropic configured
```

## Configuration File

After setup, your configuration is saved to `~/.anyclaude/config.json`:

```json
{
  "version": "1.0.0",
  "defaultProvider": "google",
  "defaultModel": "google/gemini-2.5-pro",
  "proxyPort": 60618,
  "providers": {
    "openai": {
      "baseURL": "https://api.openai.com/v1",
      "enabled": true,
      "apiKey": "sk-proj-abcd1234..."
    },
    "google": {
      "baseURL": "https://vertex.custom-vertex-ai.example.com/v1beta",
      "enabled": true,
      "apiKey": "sk-5da5d32f158c42538345bedf7ba1b76b"
    },
    "xai": {
      "baseURL": "https://api.x.ai/v1",
      "enabled": true,
      "apiKey": "xai-12345..."
    },
    "azure": {
      "baseURL": "https://mycompany.openai.azure.com",
      "enabled": true,
      "apiKey": "azure-key..."
    },
    "anthropic": {
      "baseURL": "https://api.anthropic.com",
      "enabled": false
    }
  },
  "claude": {
    "dummyApiKey": "sk-ant-api03-dummy_key_for_anyclaude_proxy_12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678",
    "note": "This is a fake key required for Claude Code compatibility - NEVER used for actual API calls"
  }
}
```

## Usage Examples

After configuration, use anyclaude with any configured provider:

```bash
# Use Google Gemini
anyclaude start --model google/gemini-2.5-pro

# Use OpenAI GPT-4
anyclaude start --model openai/gpt-4

# Use XAI Grok
anyclaude start --model xai/grok-beta

# Use Azure OpenAI
anyclaude start --model azure/gpt-4
```

## Environment Variable Priority

Configuration follows this priority order:
1. **Environment variables** (highest priority)
2. **Configuration file** (`~/.anyclaude/config.json`)
3. **Default values** (lowest priority)

This means you can override config file settings with environment variables:

```bash
# Override config file with environment variable
export GOOGLE_API_URL="https://different-endpoint.com/v1beta"
anyclaude start --model google/gemini-2.5-pro
```

## Configuration Management Commands

```bash
# Run interactive setup
bun run setup

# Show current configuration
bun run config:show

# Validate configuration
bun run config:validate

# Test configuration in proxy-only mode
PROXY_ONLY=true bun run src/main.ts --model google/gemini-2.5-pro
```

## Common Use Cases

### Corporate Proxy Setup
```bash
# Configure OpenAI through corporate proxy
🔧 Configuring OpenAI
OpenAI API Key: sk-proj-your-key
Custom base URL: https://proxy.company.com/openai/v1
```

### Multi-Region Azure Setup
```bash
# Configure Azure with specific region
🔧 Configuring Azure OpenAI
Azure OpenAI API Key: your-azure-key
Azure OpenAI Endpoint: https://mycompany-eastus.openai.azure.com
```

### Development vs Production
```bash
# Development environment
export GOOGLE_API_URL="https://dev.vertex.api.com/v1beta"

# Production environment  
export GOOGLE_API_URL="https://vertex.custom-vertex-ai.example.com/v1beta"
```

## Troubleshooting

### Configuration Issues
```bash
# Check if config exists
ls ~/.anyclaude/config.json

# Validate configuration
bun run config:validate

# View current configuration
bun run config:show
```

### Provider Issues
```bash
# Test specific provider in proxy-only mode
PROXY_ONLY=true bun run src/main.ts --model openai/gpt-4

# Check environment variables
echo $OPENAI_API_KEY
echo $OPENAI_API_URL
```

### Common Errors

**"No API key configured"**
- Run `bun run setup` to configure providers
- Or set environment variables manually

**"Invalid endpoint"**
- Check base URL format in configuration
- Ensure custom endpoints are accessible

**"Provider not found"**
- Verify provider is enabled in configuration
- Check model prefix matches provider name

## Security Notes

- API keys in config files have restricted permissions (600)
- Config directory is created with user-only access
- Dummy Anthropic key is required but never used for actual API calls
- Environment variables always override config file values for security