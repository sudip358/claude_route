# anyclaude

[![NPM Version](https://img.shields.io/npm/v/anyclaude)](https://www.npmjs.com/package/anyclaude)

Use Claude Code with OpenAI, Google, xAI, Azure, and other providers with advanced configuration management.

- **Simple setup** - Interactive setup wizard with multiple difficulty levels
- **Flexible configuration** - Environment variables, config files, or interactive setup
- **Custom endpoints** - Support for corporate proxies and custom base URLs
- **Multiple providers** - OpenAI, Google, xAI, Azure OpenAI, and Anthropic
- **Works with Claude Code GitHub Actions**
- **Optimized for OpenAI's GPT-5 series** with reasoning effort and service tier controls

<img src="./demo.png" width="65%">

## Quick Start

### Installation
```sh
# Use your favorite package manager
$ pnpm install -g anyclaude
# or
$ npm install -g anyclaude
# or  
$ bun install -g anyclaude
```

### Interactive Setup (Recommended)
```sh
# Run the interactive setup wizard
$ anyclaude-setup
# or during development
$ bun run setup
```

The setup wizard offers three options:
- **Quick setup** - Configure one provider quickly
- **Full setup** - Configure multiple providers
- **Advanced setup** - Customize all settings including proxy ports

### Manual Setup
```sh
# Set your API keys and start
$ export OPENAI_API_KEY="your-openai-key"
$ export ANTHROPIC_API_KEY="sk-ant-api03-dummy_key_for_anyclaude_proxy_12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678"
$ anyclaude --model openai/gpt-5-mini
```

### Basic Usage
```sh
# anyclaude is a wrapper for the Claude CLI
# Supported prefixes: openai/, google/, xai/, azure/, anthropic/
$ anyclaude --model openai/gpt-5-mini
$ anyclaude --model google/gemini-2.5-pro  
$ anyclaude --model xai/grok-beta
$ anyclaude --model azure/gpt-4
```

Switch models in the Claude UI with `/model openai/gpt-5-mini`.

## Configuration

### Priority System
Configuration follows this priority order:
1. **Environment variables** (highest priority)
2. **Configuration file** (`~/.anyclaude/config.json`)  
3. **Default values** (lowest priority)

### Interactive Setup Commands
```sh
# Run interactive setup wizard
$ anyclaude-setup
$ bun run setup

# Show current configuration
$ bun run config:show

# Validate configuration
$ bun run config:validate

# Test configuration without Claude Code
$ PROXY_ONLY=true bun run src/main.ts --model google/gemini-2.5-pro
```

### Configuration File
After running setup, your configuration is saved to `~/.anyclaude/config.json`:

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
      "apiKey": "sk-proj-..."
    },
    "google": {
      "baseURL": "https://generativelanguage.googleapis.com/v1beta",
      "enabled": true,
      "apiKey": "your-google-key"
    },
    "xai": {
      "baseURL": "https://api.x.ai/v1",
      "enabled": true,
      "apiKey": "xai-..."
    },
    "azure": {
      "baseURL": "https://your-resource.openai.azure.com",
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

## Environment Variables

### All Supported Providers

| Provider | API Key Environment Variable | Base URL Environment Variable | Default Base URL |
|----------|------------------------------|-------------------------------|------------------|
| OpenAI | `OPENAI_API_KEY` | `OPENAI_API_URL` | `https://api.openai.com/v1` |
| Google | `GOOGLE_API_KEY` | `GOOGLE_API_URL` | `https://generativelanguage.googleapis.com/v1beta` |
| XAI | `XAI_API_KEY` | `XAI_API_URL` | `https://api.x.ai/v1` |
| Azure | `AZURE_OPENAI_API_KEY` | `AZURE_OPENAI_ENDPOINT` | (required, no default) |
| Anthropic | `ANTHROPIC_API_KEY` | `ANTHROPIC_API_URL` | `https://api.anthropic.com` |

### Example Environment Setup
```bash
# OpenAI (standard)
export OPENAI_API_KEY="sk-proj-your-openai-key"
export OPENAI_API_URL="https://api.openai.com/v1"

# Google Gemini
export GOOGLE_API_KEY="your-google-key"
export GOOGLE_API_URL="https://generativelanguage.googleapis.com/v1beta"

# XAI Grok
export XAI_API_KEY="xai-your-key"
export XAI_API_URL="https://api.x.ai/v1"

# Azure OpenAI
export AZURE_OPENAI_API_KEY="your-azure-key"
export AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com"

# Required dummy key for Claude Code compatibility
export ANTHROPIC_API_KEY="sk-ant-api03-dummy_key_for_anyclaude_proxy_12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678"
```

### Windows PowerShell Setup
```powershell
# OpenAI setup
$env:OPENAI_API_KEY="sk-proj-your-key"
$env:OPENAI_API_URL="https://api.openai.com/v1"
$env:ANTHROPIC_API_KEY="sk-ant-api03-dummy_key_for_anyclaude_proxy_12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678"

# Start anyclaude
anyclaude --model openai/gpt-4
```

## Custom Base URLs

All providers support custom base URLs for corporate proxies, regional endpoints, or alternative implementations:

### Corporate Proxy Example
```bash
# Route OpenAI through corporate proxy
export OPENAI_API_URL="https://proxy.company.com/openai/v1"
anyclaude --model openai/gpt-4
```

### Custom Google Vertex AI Endpoint
```bash
# Use custom Vertex AI endpoint (like custom-vertex-ai.example.com)
export GOOGLE_API_URL="https://vertex.custom-vertex-ai.example.com/v1beta"
anyclaude --model google/gemini-2.5-pro
```

### Azure Regional Endpoint
```bash
# Use specific Azure region
export AZURE_OPENAI_ENDPOINT="https://mycompany-eastus.openai.azure.com"
anyclaude --model azure/gpt-4
```

## GPT-5 Advanced Features

### Reasoning Effort Control
Use `--reasoning-effort` (alias: `-e`) to control OpenAI reasoning effort:

```sh
# Available values: minimal, low, medium, high
anyclaude --model openai/gpt-5-mini -e high
anyclaude --model openai/gpt-5-pro --reasoning-effort medium
```

### Service Tier Control
Use `--service-tier` (alias: `-t`) to control OpenAI service tier:

```sh
# Available values: flex, priority
anyclaude --model openai/gpt-5-mini -t priority
anyclaude --model openai/gpt-5-pro --service-tier flex
```

## Usage Examples

### Switch Between Providers
```bash
# Use Google Gemini
anyclaude --model google/gemini-2.5-pro

# Use OpenAI GPT-4 with high reasoning
anyclaude --model openai/gpt-4 -e high

# Use XAI Grok
anyclaude --model xai/grok-beta

# Use Azure OpenAI with priority tier
anyclaude --model azure/gpt-4 -t priority

# Override config with environment variable
GOOGLE_API_URL="https://different-endpoint.com/v1beta" anyclaude --model google/gemini-2.5-pro
```

### Development Testing
```bash
# Test proxy without launching Claude Code
PROXY_ONLY=true anyclaude --model openai/gpt-4

# Test specific provider configuration
PROXY_ONLY=true bun run src/main.ts --model google/gemini-2.5-pro
```

## Model Routing

Anyclaude automatically routes requests based on model prefixes:

| Model Prefix | Routes To | Example Models |
|--------------|-----------|----------------|
| `openai/` | OpenAI | `openai/gpt-4`, `openai/gpt-5-mini`, `openai/gpt-3.5-turbo` |
| `google/` | Google | `google/gemini-2.5-pro`, `google/gemini-2.0-flash` |
| `xai/` | XAI | `xai/grok-beta`, `xai/grok-2` |
| `azure/` | Azure OpenAI | `azure/gpt-4`, `azure/gpt-35-turbo` |
| `anthropic/` | Anthropic | `anthropic/claude-3-sonnet`, `anthropic/claude-3-haiku` |

## Common Use Cases

### Multi-Environment Setup
```bash
# Development environment
export GOOGLE_API_URL="https://dev.vertex.api.com/v1beta"

# Production environment
export GOOGLE_API_URL="https://vertex.custom-vertex-ai.example.com/v1beta"
```

### Corporate Network
```bash
# Setup for corporate proxy
anyclaude-setup
# Select "Advanced setup" → Configure custom URLs
# Enter: https://proxy.company.com/openai/v1
```

### Multiple Provider Testing
```bash
# Quick comparison between providers
anyclaude --model openai/gpt-4      # Test with OpenAI
anyclaude --model google/gemini-2.5-pro   # Test with Google
anyclaude --model xai/grok-beta     # Test with XAI
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
PROXY_ONLY=true anyclaude --model openai/gpt-4

# Check environment variables
echo $OPENAI_API_KEY
echo $OPENAI_API_URL
```

### Common Errors

**"No API key configured"**
- Run `anyclaude-setup` to configure providers
- Or set environment variables manually

**"Invalid endpoint"**
- Check base URL format in configuration
- Ensure custom endpoints are accessible
- Verify HTTPS is used for custom URLs

**"Provider not found"**
- Verify provider is enabled in configuration
- Check model prefix matches provider name
- Ensure API key is configured for the provider

## FAQ

### What providers are supported?

See [the providers implementation](./src/main.ts#L17) for details.

- **OpenAI**: `OPENAI_API_KEY` supports `openai/*` models (GPT-4, GPT-5, etc.)
- **Google**: `GOOGLE_API_KEY` supports `google/*` models (Gemini 2.5 Pro, etc.)
- **XAI**: `XAI_API_KEY` supports `xai/*` models (Grok Beta, etc.)
- **Azure**: `AZURE_OPENAI_API_KEY` supports `azure/*` models
- **Anthropic**: `ANTHROPIC_API_KEY` supports `anthropic/*` models

### How does this work?

Claude Code has added support for customizing the Anthropic endpoint with `ANTHROPIC_BASE_URL`.

anyclaude spawns a simple HTTP server that translates between Anthropic's format and the [AI SDK](https://github.com/vercel/ai) format, enabling support for any [AI SDK](https://github.com/vercel/ai) provider.

### Why do I need a dummy Anthropic API key?

Claude Code requires an Anthropic API key for compatibility, but anyclaude routes calls to other providers based on model prefixes. The dummy key is never used for actual API calls.

### Can I use custom endpoints?

Yes! All providers support custom base URLs through environment variables or the configuration file. This enables:
- Corporate proxy routing
- Regional endpoints
- Alternative API implementations
- Custom load balancers

## Documentation

- **[Setup Guide](./SETUP_GUIDE.md)** - Comprehensive setup instructions
- **[Base URL Configuration](./BASE_URL_CONFIGURATION.md)** - Custom endpoint configuration
- **[Usage Guide](./USAGE_GUIDE.md)** - Advanced usage examples

## Development

```bash
# Install dependencies
bun install

# Build the project
bun run build

# Run setup during development
bun run setup

# Test configuration
bun run config:validate

# Run in proxy-only mode for testing
PROXY_ONLY=true bun run src/main.ts --model openai/gpt-4
