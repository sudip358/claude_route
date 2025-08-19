#!/usr/bin/env python3
"""
Test script for Gemini and Anthropic models with custom base URLs
This helps verify your API keys and endpoints work before using anyclaude
"""

import os
import requests
import json
from typing import Dict, Any, Optional

class ModelTester:
    def __init__(self):
        # Load environment variables
        self.google_api_key = os.getenv('GOOGLE_API_KEY')
        self.google_base_url = os.getenv('GOOGLE_API_URL', 'https://generativelanguage.googleapis.com/v1beta')
        self.anthropic_api_key = os.getenv('ANTHROPIC_API_KEY')
        self.anthropic_base_url = os.getenv('ANTHROPIC_BASE_URL', 'https://api.anthropic.com')
        
    def test_google_models(self):
        """Test various Google/Gemini models"""
        if not self.google_api_key:
            print("❌ GOOGLE_API_KEY not set")
            return
            
        print(f"🔍 Testing Google Models with base URL: {self.google_base_url}")
        print(f"🔑 API Key: {self.google_api_key[:10]}...")
        
        # Test available models first
        self.list_google_models()
        
        # Test different Gemini models
        models_to_test = [
            'gemini-2.0-flash-exp',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'gemini-1.0-pro'
        ]
        
        for model in models_to_test:
            self.test_google_chat(model)
    
    def list_google_models(self):
        """List available Google models"""
        try:
            url = f"{self.google_base_url}/models"
            headers = {
                'x-goog-api-key': self.google_api_key,
                'Content-Type': 'application/json'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Available Google Models:")
                for model in data.get('models', [])[:5]:  # Show first 5
                    name = model.get('name', 'Unknown').replace('models/', '')
                    display_name = model.get('displayName', 'No display name')
                    print(f"   • {name} - {display_name}")
            else:
                print(f"❌ Failed to list models: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"❌ Error listing Google models: {e}")
    
    def test_google_chat(self, model: str):
        """Test Google model with a simple chat"""
        try:
            url = f"{self.google_base_url}/models/{model}:generateContent"
            headers = {
                'x-goog-api-key': self.google_api_key,
                'Content-Type': 'application/json'
            }
            
            data = {
                "contents": [{
                    "parts": [{"text": "Hello! Just testing the connection. Reply with 'OK' if you can see this."}]
                }],
                "generationConfig": {
                    "maxOutputTokens": 50,
                    "temperature": 0.1
                }
            }
            
            response = requests.post(url, headers=headers, json=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if 'candidates' in result and result['candidates']:
                    text = result['candidates'][0]['content']['parts'][0]['text']
                    print(f"✅ {model}: {text.strip()}")
                else:
                    print(f"⚠️  {model}: Empty response")
            else:
                print(f"❌ {model}: {response.status_code} - {response.text[:100]}")
                
        except Exception as e:
            print(f"❌ {model}: Error - {e}")
    
    def test_anthropic_models(self):
        """Test Anthropic models"""
        if not self.anthropic_api_key:
            print("❌ ANTHROPIC_API_KEY not set")
            return
            
        print(f"\n🔍 Testing Anthropic Models with base URL: {self.anthropic_base_url}")
        print(f"🔑 API Key: {self.anthropic_api_key[:10]}...")
        
        # Test different Claude models
        models_to_test = [
            'claude-3-5-sonnet-20241022',
            'claude-3-5-haiku-20241022',
            'claude-3-opus-20240229',
            'claude-3-sonnet-20240229'
        ]
        
        for model in models_to_test:
            self.test_anthropic_chat(model)
    
    def test_anthropic_chat(self, model: str):
        """Test Anthropic model with a simple chat"""
        try:
            url = f"{self.anthropic_base_url}/v1/messages"
            headers = {
                'x-api-key': self.anthropic_api_key,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            }
            
            data = {
                "model": model,
                "max_tokens": 50,
                "temperature": 0.1,
                "messages": [
                    {"role": "user", "content": "Hello! Just testing the connection. Reply with 'OK' if you can see this."}
                ]
            }
            
            response = requests.post(url, headers=headers, json=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if 'content' in result and result['content']:
                    text = result['content'][0]['text']
                    print(f"✅ {model}: {text.strip()}")
                else:
                    print(f"⚠️  {model}: Empty response")
            else:
                print(f"❌ {model}: {response.status_code} - {response.text[:100]}")
                
        except Exception as e:
            print(f"❌ {model}: Error - {e}")
    
    def test_anyclaude_proxy(self, proxy_url: str):
        """Test anyclaude proxy server"""
        print(f"\n🔍 Testing anyclaude proxy at: {proxy_url}")
        
        # Test with different provider/model combinations
        test_models = []
        
        if self.google_api_key:
            test_models.append("google/gemini-2.0-flash-exp")
        if self.anthropic_api_key:
            test_models.append("anthropic/claude-3-5-sonnet-20241022")
            
        for model in test_models:
            self.test_proxy_model(proxy_url, model)
    
    def test_proxy_model(self, proxy_url: str, model: str):
        """Test a specific model through the proxy"""
        try:
            url = f"{proxy_url}/v1/messages"
            headers = {
                'x-api-key': 'dummy-key',  # anyclaude doesn't use this
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            }
            
            data = {
                "model": model,
                "max_tokens": 50,
                "temperature": 0.1,
                "messages": [
                    {"role": "user", "content": "Hello! Testing proxy connection. Reply with 'OK'."}
                ]
            }
            
            response = requests.post(url, headers=headers, json=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if 'content' in result and result['content']:
                    text = result['content'][0]['text']
                    print(f"✅ Proxy {model}: {text.strip()}")
                else:
                    print(f"⚠️  Proxy {model}: Empty response")
            else:
                print(f"❌ Proxy {model}: {response.status_code} - {response.text[:100]}")
                
        except Exception as e:
            print(f"❌ Proxy {model}: Error - {e}")
    
    def check_environment(self):
        """Check environment variables"""
        print("🔧 Environment Variables Check:")
        
        vars_to_check = [
            ('GOOGLE_API_KEY', self.google_api_key),
            ('GOOGLE_API_URL', self.google_base_url),
            ('ANTHROPIC_API_KEY', self.anthropic_api_key),
            ('ANTHROPIC_BASE_URL', self.anthropic_base_url)
        ]
        
        for var_name, var_value in vars_to_check:
            if var_value:
                if 'KEY' in var_name:
                    print(f"✅ {var_name}: {var_value[:10]}...{var_value[-4:]}")
                else:
                    print(f"✅ {var_name}: {var_value}")
            else:
                print(f"❌ {var_name}: Not set")
        
        print()

def main():
    print("🚀 AnyClaude Model Tester")
    print("=" * 50)
    
    tester = ModelTester()
    
    # Check environment
    tester.check_environment()
    
    # Test Google models
    if tester.google_api_key:
        tester.test_google_models()
    else:
        print("⏭️  Skipping Google tests (no API key)")
    
    # Test Anthropic models
    if tester.anthropic_api_key:
        tester.test_anthropic_models()
    else:
        print("⏭️  Skipping Anthropic tests (no API key)")
    
    # Test proxy if running
    proxy_url = os.getenv('ANYCLAUDE_PROXY_URL')
    if proxy_url:
        tester.test_anyclaude_proxy(proxy_url)
    else:
        print("\n💡 To test anyclaude proxy:")
        print("   1. Run: PROXY_ONLY=true anyclaude")
        print("   2. Set ANYCLAUDE_PROXY_URL to the displayed URL")
        print("   3. Run this script again")

if __name__ == "__main__":
    main()
