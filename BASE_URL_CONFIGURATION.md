# Base URL Configuration for All Providers

Anyclaude supports custom base URLs for all AI providers, allowing you to:
- Use corporate proxies
- Route through custom endpoints
- Test with alternative API implementations
- Use provider-specific regional endpoints

## Environment Variables

### OpenAI
```bash
export OPENAI_API_KEY="your-openai-key"
export OPENAI_API_URL="https://api.openai.com/v1"  # Default, or custom URL
```

### Google (Gemini)
```bash
export GOOGLE_API_KEY="your-google-key"
export GOOGLE_API_URL="https://generativelanguage.googleapis.com/v1beta"  # Default, or custom URL
```

### XAI (Grok)
```bash
export XAI_API_KEY="your-xai-key"
export XAI_API_URL="https://api.x.ai/v1"  # Default, or custom URL
```

### Azure OpenAI
```bash
export AZURE_OPENAI_API_KEY="your-azure-key"
export AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com"  # Required for Azure
```

### Anthropic
```bash
export ANTHROPIC_API_KEY="your-anthropic-key"  # Usually dummy for claude_route
export ANTHROPIC_API_URL="https://api.anthropic.com"  # Default, or custom URL
```

## Usage Examples

### Using Corporate Proxy
```bash
# Route OpenAI through corporate proxy
export OPENAI_API_URL="https://proxy.company.com/openai/v1"
claude_route start --model openai/gpt-4
```

### Custom Google Vertex AI Endpoint
```bash
# Use custom Vertex AI endpoint (like custom-vertex-ai.example.com)
export GOOGLE_API_URL="https://vertex.custom-vertex-ai.example.com/v1beta"
claude_route start --model google/gemini-2.5-pro
```

### Azure OpenAI Regional Endpoint
```bash
# Use specific Azure region
export AZURE_OPENAI_ENDPOINT="https://mycompany-eastus.openai.azure.com"
claude_route start --model azure/gpt-4
```

### XAI Custom Endpoint
```bash
# Use custom XAI endpoint
export XAI_API_URL="https://api.custom-xai.com/v1"
claude_route start --model xai/grok-beta
```

## PowerShell Examples (Windows)

```powershell
# OpenAI with custom base URL
$env:OPENAI_API_KEY="your-key"
$env:OPENAI_API_URL="https://api.custom-openai.com/v1"
$env:ANTHROPIC_API_KEY="sk-ant-api03-dummy_key_for_claude_route_proxy_12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678"
bun run src/main.ts --model openai/gpt-4

# Google with Vertex AI proxy
$env:GOOGLE_API_KEY="your-key"
$env:GOOGLE_API_URL="https://vertex.custom-vertex-ai.example.com/v1beta"
$env:ANTHROPIC_API_KEY="sk-ant-api03-dummy_key_for_claude_route_proxy_12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678"
bun run src/main.ts --model google/gemini-2.5-pro
```

## Provider Routing Logic

The claude_route proxy automatically routes requests based on the model prefix:

| Model Prefix | Provider | API Key Env | Base URL Env |
|--------------|----------|-------------|---------------|
| `openai/` | OpenAI | `OPENAI_API_KEY` | `OPENAI_API_URL` |
| `google/` | Google | `GOOGLE_API_KEY` | `GOOGLE_API_URL` |
| `xai/` | XAI | `XAI_API_KEY` | `XAI_API_URL` |
| `azure/` | Azure | `AZURE_OPENAI_API_KEY` | `AZURE_OPENAI_ENDPOINT` |
| `anthropic/` | Anthropic | `ANTHROPIC_API_KEY` | `ANTHROPIC_API_URL` |

## Important Notes

1. **Dummy Anthropic Key**: The `ANTHROPIC_API_KEY` is usually a dummy/fake key for Claude Code compatibility. Real API calls go to the provider specified by the model prefix.

2. **Base URL Format**: Ensure your custom base URLs follow the provider's expected format:
   - OpenAI: Should end with `/v1`
   - Google: Should include version like `/v1beta`
   - Azure: Full resource URL without `/v1` suffix
   - XAI: Should end with `/v1`

3. **HTTPS Required**: All custom base URLs should use HTTPS for security.

4. **Testing**: Use `PROXY_ONLY=true` to test configuration without launching Claude Code:
   ```bash
   PROXY_ONLY=true bun run src/main.ts --model openai/gpt-4
   ```

## Troubleshooting

- **Invalid base URL**: Ensure the URL is accessible and follows the provider's API format
- **Authentication errors**: Verify both API key and base URL are correct for your custom endpoint
- **Proxy issues**: Check if your custom endpoint requires additional headers or authentication