# Alibaba Cloud Integration with VSCode/Roo Code

> **Comprehensive Integration Guide** | Last Updated: 2026-05-13

---

## Table of Contents

1. [Overview](#overview)
2. [Official VSCode Extensions](#official-vscode-extensions)
3. [Alibaba Cloud CLI Tools](#alibaba-cloud-cli-tools)
4. [DashScope API & Qwen Integration](#dashscope-api--qwen-integration)
5. [MCP (Model Context Protocol) Options](#mcp-model-context-protocol-options)
6. [Third-Party Integrations](#third-party-integrations)
7. [Authentication Methods](#authentication-methods)
8. [Configuration Steps](#configuration-steps)
9. [Known Limitations & Workarounds](#known-limitations--workarounds)
10. [Recommended Architecture](#recommended-architecture)

---

## Overview

Alibaba Cloud offers multiple pathways for integration with VSCode and Roo Code:

```mermaid
graph TD
    A[VSCode/Roo Code] --> B[Official Extensions]
    A --> C[CLI Tools]
    A --> D[DashScope API]
    A --> E[MCP Servers]
    
    B --> B1[Tongyi Lingma]
    B --> B2[ROS Toolkit]
    B --> B3[ACK Toolkit]
    
    C --> C1[Alibaba Cloud CLI]
    C --> C2[OSS CLI]
    C --> C3[Terraform Provider]
    
    D --> D1[OpenAI-Compatible API]
    D --> D2[Qwen Models]
    D --> D3[DashScope SDK]
    
    E --> E1[Custom MCP Server]
    E --> E2[OpenRouter Bridge]
```

---

## Official VSCode Extensions

### 1. Tongyi Lingma (通义灵码)

**Status:** Official Alibaba AI Coding Assistant Extension

| Property | Value |
|----------|-------|
| Extension ID | `alibaba-cloud.tongyi-lingma` |
| Publisher | Alibaba Cloud |
| Marketplace | [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=alibaba-cloud.tongyi-lingma) |

**Features:**
- AI-powered code completion powered by Qwen models
- Code generation from natural language descriptions
- Code explanation and documentation
- Unit test generation
- Code review and optimization suggestions
- Multi-language support (Python, JavaScript/TypeScript, Java, Go, etc.)

**Installation:**
```powershell
# Via VSCode Command Palette
# Press Ctrl+Shift+P → "Extensions: Install Extensions" → Search "Tongyi Lingma"

# Or via CLI
code --install-extension alibaba-cloud.tongyi-lingma
```

**Configuration:**
```json
// .vscode/settings.json
{
    "tongyiLingma.apiKey": "your-dashscope-api-key",
    "tongyiLingma.model": "qwen-plus",
    "tongyiLingma.enableCompletion": true,
    "tongyiLingma.enableChat": true
}
```

**Authentication:**
- Requires a DashScope API key from [Alibaba Cloud DashScope Console](https://dashscope.console.aliyun.com/)
- Free tier available with rate limits

---

### 2. Resource Orchestration Service (ROS) Toolkit

**Status:** Official Infrastructure-as-Code Extension

| Property | Value |
|----------|-------|
| Purpose | Manage Alibaba Cloud ROS stacks |
| Features | Template editing, stack deployment, resource visualization |

**Installation:**
```powershell
code --install-extension alibaba-cloud.ros-toolkit
```

---

### 3. Container Service for Kubernetes (ACK) Toolkit

**Status:** Official Kubernetes Management Extension

| Property | Value |
|----------|-------|
| Purpose | Manage ACK clusters |
| Features | Pod management, service monitoring, log viewing |

**Installation:**
```powershell
code --install-extension alibaba-cloud.ack-toolkit
```

---

### 4. Cloud Shell Extension

**Status:** Official Browser-Based CLI Extension

- Provides browser-based terminal access to Alibaba Cloud
- Pre-authenticated with your cloud credentials
- Supports all standard Alibaba Cloud CLI commands

---

## Alibaba Cloud CLI Tools

### Alibaba Cloud CLI (aliyun)

**Installation:**
```powershell
# Windows (using pip)
pip install alibabacloud_credentials
pip install alibabacloud_openapi_utility
pip install alibabacloud_tea_openapi

# Or using the official installer
# Download from: https://www.alibabacloud.com/help/en/cli
```

**Configuration:**
```powershell
# Initialize CLI configuration
aliyun configure

# Or set environment variables
$env:ALIBABA_CLOUD_ACCESS_KEY_ID="your-access-key-id"
$env:ALIBABA_CLOUD_ACCESS_KEY_SECRET="your-access-key-secret"
$env:ALIBABA_CLOUD_REGION="us-east-1"

# Verify configuration
aliyun sts GetCallerIdentity
```

**Key Capabilities:**

| Service | CLI Commands | Documentation |
|---------|-------------|---------------|
| OSS (Object Storage) | `aliyun oss` | [OSS CLI Guide](https://www.alibabacloud.com/help/en/oss/) |
| ECS (Compute) | `aliyun ecs` | [ECS CLI Guide](https://www.alibabacloud.com/help/en/ecs/) |
| VPC (Networking) | `aliyun vpc` | [VPC CLI Guide](https://www.alibabacloud.com/help/en/vpc/) |
| RDS (Database) | `aliyun rds` | [RDS CLI Guide](https://www.alibabacloud.com/help/en/rds/) |
| Function Compute | `aliyun fc` | [FC CLI Guide](https://www.alibabacloud.com/help/en/function-compute/) |
| ACK (Kubernetes) | `aliyun ack` | [ACK CLI Guide](https://www.alibabacloud.com/help/en/ack/) |
| ROS (Infrastructure) | `aliyun ros` | [ROS CLI Guide](https://www.alibabacloud.com/help/en/ros/) |

---

### OSS CLI (ossutil)

**Installation:**
```powershell
# Download ossutil from:
# https://www.alibabacloud.com/help/en/oss/developer-reference/download-ossutil
```

**Usage:**
```powershell
# Configure ossutil
ossutil config

# Sync local directory to OSS bucket
ossutil cp -r ./dist oss://my-bucket/

# Sync from OSS to local
ossutil cp -r oss://my-bucket/ ./download/

# List objects
ossutil ls oss://my-bucket/
```

---

### Terraform Provider for Alibaba Cloud

**Installation:**
```powershell
# Install Terraform
# Download from: https://www.terraform.io/downloads

# The Alibaba Cloud provider is included by default
terraform init
```

**Example Configuration:**
```hcl
terraform {
  required_providers {
    alibabacloud = {
      source  = "AlibabaCloud/alibabacloud"
      version = "~> 1.86"
    }
  }
}

provider "alibabacloud" {
  region     = "us-east-1"
  access_key = var.access_key
  secret_key = var.secret_key
}

resource "alibabacloud_oss_bucket" "my_bucket" {
  bucket = "my-unique-bucket-name"
}
```

---

## DashScope API & Qwen Integration

### DashScope Overview

DashScope is Alibaba Cloud's AI model service platform, providing access to Qwen (通义千问) models via an OpenAI-compatible API.

**Base URL:**
- International: `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`
- China: `https://dashscope.aliyuncs.com/compatible-mode/v1`

### Available Qwen Models

| Model | Use Case | Context Window |
|-------|----------|----------------|
| `qwen-turbo` | Fast, lightweight tasks | 8,192 tokens |
| `qwen-plus` | Balanced performance | 32,768 tokens |
| `qwen-max` | Complex reasoning | 32,768 tokens |
| `qwen-long` | Long document processing | 1,000,000 tokens |
| `qwen-vl-max` | Vision-language tasks | 7,650 tokens |
| `qwen-audio-turbo` | Audio processing | 8,192 tokens |

### Python SDK Integration

```python
# Install the DashScope SDK
pip install dashscope

import dashscope
from dashscope import Generation

# Configure API key
dashscope.api_key = "sk-your-dashscope-api-key"

# Generate text using Qwen
response = Generation.call(
    model="qwen-plus",
    prompt="Explain the concept of microservices architecture"
)

print(response.output.text)
```

### OpenAI-Compatible API Usage

```python
from openai import OpenAI

# Use DashScope as an OpenAI-compatible endpoint
client = OpenAI(
    api_key="sk-your-dashscope-api-key",
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
)

response = client.chat.completions.create(
    model="qwen-plus",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Write a Python function to sort a list"}
    ]
)

print(response.choices[0].message.content)
```

### Node.js Integration (for Roo Code)

```javascript
const axios = require('axios');

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
const DASHSCOPE_BASE_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';

async function callQwen(messages, model = 'qwen-plus') {
    const response = await axios.post(
        `${DASHSCOPE_BASE_URL}/chat/completions`,
        {
            model: model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 2048
        },
        {
            headers: {
                'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data.choices[0].message.content;
}

// Example usage
const messages = [
    { role: 'system', content: 'You are a helpful coding assistant.' },
    { role: 'user', content: 'Help me debug this Python code' }
];

callQwen(messages)
    .then(result => console.log(result))
    .catch(error => console.error(error));
```

---

## MCP (Model Context Protocol) Options

### Current State of Alibaba Cloud MCP

As of 2026, there is **no official Alibaba Cloud MCP server**. However, there are several approaches to bridge Alibaba Cloud services with MCP-compatible tools like Roo Code:

### Option 1: Custom MCP Server for Alibaba Cloud

Create a custom MCP server that exposes Alibaba Cloud services:

```javascript
// mcp-servers/alibaba-cloud-mcp/server.js
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as alibabacloud from '@alicloud/pop-core';

const server = new McpServer({
    name: 'alibaba-cloud-mcp',
    version: '1.0.0'
});

// Configure Alibaba Cloud client
const client = alibabacloud.defaultClient({
    accessKeyId: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
    endpoint: 'https://ecs.us-east-1.aliyuncs.com'
});

// Tool: List ECS instances
server.tool('alibaba_list_ecs_instances', 'List all ECS instances in a region', {
    regionId: { type: 'string', description: 'Alibaba Cloud region ID' }
}, async ({ regionId }) => {
    const params = {
        RegionId: regionId,
        PageSize: 50
    };
    const response = await client.request('DescribeInstances', params);
    return {
        content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
    };
});

// Tool: List OSS buckets
server.tool('alibaba_list_oss_buckets', 'List all OSS buckets', {}, async () => {
    const params = {
        'x-oss-account-id': 'current'
    };
    const response = await client.request('Get', params);
    return {
        content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
    };
});

// Tool: Trigger Function Compute
server.tool('alibaba_trigger_fc', 'Trigger a Function Compute function', {
    serviceName: { type: 'string' },
    functionName: { type: 'string' },
    payload: { type: 'string', optional: true }
}, async ({ serviceName, functionName, payload }) => {
    const client = alibabacloud.defaultClient({
        accessKeyId: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID,
        accessKeySecret: process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
        endpoint: 'https://fc.us-east-1.aliyuncs.com'
    });
    const params = {
        ServiceName: serviceName,
        FunctionName: functionName
    };
    if (payload) {
        params.functionCustomMetadata = `payload=${payload}`;
    }
    const response = await client.request('InvokeFunction', params);
    return {
        content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
    };
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log('Alibaba Cloud MCP Server running on stdio');
}

main().catch(console.error);
```

**Package Dependencies:**
```json
{
    "name": "alibaba-cloud-mcp",
    "version": "1.0.0",
    "type": "module",
    "scripts": {
        "start": "node server.js"
    },
    "dependencies": {
        "@modelcontextprotocol/sdk": "^1.0.0",
        "@alicloud/pop-core": "^1.7.0"
    }
}
```

### Option 2: OpenRouter Bridge

Use OpenRouter as a bridge to access Qwen models:

```javascript
// The workspace already has OpenRouter integration
// Reference: smart-book/qwen-agent.js

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const QWEN_MODEL = 'alibaba-cloud/qwen-qwq-32b-a3b';

async function callQwenViaOpenRouter(messages) {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://your-site.com',
            'X-Title': 'Roo Code Alibaba Integration'
        },
        body: JSON.stringify({
            model: QWEN_MODEL,
            messages: messages
        })
    });
    return response.json();
}
```

### Option 3: Use Existing MCP Servers with Alibaba Cloud

The workspace already has a Playwright MCP server setup:

```json
// mcp-servers/playwright-server/package.json
{
    "name": "playwright-server",
    "dependencies": {
        "@playwright/mcp": "^1.0.0"
    }
}
```

You can extend this to include Alibaba Cloud resource monitoring and management.

---

## Third-Party Integrations

### 1. VSCode Alibaba Cloud Toolkit (Community)

Several community-maintained extensions provide Alibaba Cloud integration:

| Extension | Publisher | Features |
|-----------|-----------|----------|
| `alibabacloud.alicloud` | Community | General cloud management |
| `mrs.gled-rs.alicloud-oss-browser` | gled-rs | OSS bucket browser |
| `yza.alicloud-sls` | Community | Simple Log Service integration |

### 2. JetBrains Plugin (for Reference)

While not VSCode-specific, the [Alibaba Cloud Toolkit for JetBrains](https://www.alibabacloud.com/help/en/dev-center/user-guide/alibaba-cloud-toolkit-for-jetbrains) provides a reference for feature sets:
- ECS management
- Docker deployment
- RAM authentication
- Code-to-cloud deployment pipeline

### 3. GitHub Actions for Alibaba Cloud

```yaml
# .github/workflows/alibaba-deploy.yml
name: Deploy to Alibaba Cloud

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure Alibaba Cloud Credentials
        uses: alibabacloud/configure-action@v0
        with:
          access-key-id: ${{ secrets.ALIBABA_CLOUD_ACCESS_KEY_ID }}
          access-key-secret: ${{ secrets.ALIBABA_CLOUD_ACCESS_KEY_SECRET }}
          region: us-east-1
      
      - name: Deploy to OSS
        run: |
          aliyun oss cp -r ./dist oss://my-bucket/ --recursive
```

---

## Authentication Methods

### 1. Access Key Pair (Recommended for CLI/Programmatic Access)

**Setup:**
```powershell
# 1. Log in to Alibaba Cloud Console
# Navigate to: https://ram.console.aliyun.com/manage/ak

# 2. Create Access Key
# - Click "Create AccessKey"
# - Save the AccessKey ID and AccessKey Secret securely

# 3. Configure in environment variables
$env:ALIBABA_CLOUD_ACCESS_KEY_ID="LTAI5txxxxxxxxx"
$env:ALIBABA_CLOUD_ACCESS_KEY_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 4. Configure CLI
aliyun configure set --profile default \
    --mode AK \
    --access-key-id $env:ALIBABA_CLOUD_ACCESS_KEY_ID \
    --access-key-secret $env:ALIBABA_CLOUD_ACCESS_KEY_SECRET \
    --region us-east-1
```

### 2. RAM Role Assumption (Recommended for Production)

```python
from alibabacloud_credentials.client import Client
from alibabacloud_credentials.models import Config

# Configure RAM role assumption
config = Config(
    type='ram_role_arn',
    access_key_id='your-access-key-id',
    access_key_secret='your-access-key-secret',
    role_arn='acs:ram::123456789:role/your-role',
    role_session_name='your-session-name'
)

client = Client(config)
```

### 3. Instance RAM Role (For ECS Instances)

When running on Alibaba Cloud ECS, assign a RAM role to the instance:
```powershell
# No credentials needed - automatically picked up from metadata
# Access metadata at: http://100.100.100.200/latest/meta-data/
```

### 4. DashScope API Key (For AI Model Access)

```powershell
# Create API key at: https://dashscope.console.aliyun.com/
$env:DASHSCOPE_API_KEY="sk-your-api-key-here"
```

### 5. Bearer Token Authentication

Some DashScope endpoints support bearer token authentication:
```javascript
headers: {
    'Authorization': 'Bearer sk-your-dashscope-api-key',
    'X-DashScope-WorkSpace': 'your-workspace-id'  // Optional
}
```

---

## Configuration Steps

### Step-by-Step: Connect Alibaba Cloud with Roo Code

```mermaid
sequenceDiagram
    participant RC as Roo Code
    participant ENV as Environment
    participant API as DashScope API
    participant AC as Alibaba Cloud CLI
    participant OSS as OSS Storage
    
    RC->>ENV: Read .env for DASHSCOPE_API_KEY
    RC->>API: Send chat completion request
    API-->>RC: Return Qwen response
    
    RC->>ENV: Read .env for ALIBABA_CLOUD_*
    RC->>AC: Execute CLI command
    AC-->>RC: Return cloud resource info
    
    RC->>AC: Upload files via ossutil
    AC->>OSS: Store files in bucket
    OSS-->>AC: Confirm upload
    AC-->>RC: Return success
```

### 1. Environment Setup

Create a `.env` file in your project root:

```bash
# Alibaba Cloud Credentials
ALIBABA_CLOUD_ACCESS_KEY_ID=your-access-key-id
ALIBABA_CLOUD_ACCESS_KEY_SECRET=your-access-key-secret
ALIBABA_CLOUD_REGION=us-east-1
ALIBABA_CLOUD_PROFILE=default

# DashScope API (for Qwen models)
DASHSCOPE_API_KEY=sk-your-dashscope-api-key
DASHSCOPE_MODEL=qwen-plus
DASHSCOPE_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1

# OSS Configuration
OSS_BUCKET=your-bucket-name
OSS_ENDPOINT=oss-us-east-1.aliyuncs.com

# OpenRouter (alternative Qwen access)
OPENROUTER_API_KEY=your-openrouter-api-key
```

### 2. VSCode Settings Configuration

```json
// .vscode/settings.json
{
    "terminal.integrated.env.windows": {
        "ALIBABA_CLOUD_REGION": "us-east-1",
        "DASHSCOPE_MODEL": "qwen-plus"
    },
    "files.associations": {
        "*.yaml": "yaml",
        "*.yml": "yaml"
    },
    "editor.formatOnSave": true,
    "json.schemaDownload.enable": true
}
```

### 3. Roo Code MCP Configuration

```json
// .roo/mcp.json (or equivalent Roo Code configuration)
{
    "mcpServers": {
        "alibaba-cloud": {
            "command": "node",
            "args": ["mcp-servers/alibaba-cloud-mcp/server.js"],
            "env": {
                "ALIBABA_CLOUD_ACCESS_KEY_ID": "${env:ALIBABA_CLOUD_ACCESS_KEY_ID}",
                "ALIBABA_CLOUD_ACCESS_KEY_SECRET": "${env:ALIBABA_CLOUD_ACCESS_KEY_SECRET}",
                "ALIBABA_CLOUD_REGION": "us-east-1"
            }
        },
        "playwright": {
            "command": "npx",
            "args": ["@playwright/mcp", "--port", "8931"],
            "env": {
                "BROWSER": "chromium"
            }
        }
    }
}
```

### 4. Verify Connection

```powershell
# Test Alibaba Cloud CLI connection
aliyun sts GetCallerIdentity

# Test DashScope API
curl -X POST "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions" \
    -H "Authorization: Bearer $env:DASHSCOPE_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"model":"qwen-plus","messages":[{"role":"user","content":"Hello"}]}'

# Test OSS connection
aliyun oss ls
```

---

## Known Limitations & Workarounds

### 1. Language Barrier

**Issue:** Many Alibaba Cloud documentation pages are primarily in Chinese.

**Workaround:**
- Use the international documentation portal: https://www.alibabacloud.com/docs/
- Use browser translation for Chinese-specific docs
- Reference the Chinese docs for the most up-to-date feature information: https://help.aliyun.com/

### 2. Region Availability

**Issue:** Not all Alibaba Cloud services are available in all regions.

**Workaround:**
- Check service availability by region: https://www.alibabacloud.com/help/en/product/100458.html
- Use `us-east-1` (Hangzhou) or `us-west-1` (Silicon Valley) for most comprehensive service availability

### 3. Rate Limits on DashScope

**Issue:** Free tier has rate limits on API calls.

**Workaround:**
```python
import time
from tenacity import retry, wait_exponential, stop_after_attempt

@retry(
    wait=wait_exponential(multiplier=1, min=4, max=10),
    stop=stop_after_attempt(3)
)
def call_with_retry(messages):
    response = call_dashscope(messages)
    if response.status_code == 429:
        raise Exception("Rate limited")
    return response
```

### 4. No Official MCP Server

**Issue:** No official Alibaba Cloud MCP server exists.

**Workaround:**
- Use the custom MCP server template provided above
- Contribute to community MCP server projects
- Use OpenRouter as an intermediary for model access

### 5. Network Connectivity

**Issue:** Some Alibaba Cloud endpoints may be slow or unreachable from certain regions.

**Workaround:**
- Use international endpoints (`dashscope-intl.aliyuncs.com`)
- Configure proper DNS settings
- Consider using Alibaba Cloud CDN for static assets

### 6. Credential Security

**Issue:** Managing Access Keys securely in development environments.

**Workaround:**
```powershell
# Use Windows Credential Manager
cmdkey /add:AlibabaCloud /user:your-access-key-id /pass:your-access-key-secret

# Or use a secrets manager
# HashiCorp Vault, AWS Secrets Manager, or Alibaba Cloud KMS
```

---

## Recommended Architecture

```mermaid
graph LR
    subgraph "Development Environment"
        A[VSCode/Roo Code]
        B[Tongyi Lingma Extension]
        C[Custom MCP Server]
        D[Terminal/CLI]
    end
    
    subgraph "Alibaba Cloud Services"
        E[DashScope API - Qwen Models]
        F[OSS - Storage]
        G[ECS - Compute]
        H[Function Compute]
        I[ACK - Kubernetes]
    end
    
    subgraph "Authentication"
        J[RAM Roles]
        K[Access Keys]
        L[API Keys]
    end
    
    A --> B
    A --> C
    A --> D
    B --> E
    C --> F
    C --> G
    C --> H
    D --> E
    D --> F
    D --> G
    
    J --> G
    J --> H
    K --> F
    L --> E
```

---

## Quick Reference Links

| Resource | Link |
|----------|------|
| Alibaba Cloud International | https://www.alibabacloud.com |
| Alibaba Cloud Documentation | https://www.alibabacloud.com/docs/en/ |
| DashScope Console | https://dashscope.console.aliyun.com/ |
| DashScope API Docs | https://help.aliyun.com/zh/dashscope/ |
| RAM Console (Access Keys) | https://ram.console.aliyun.com/manage/ak |
| VSCode Marketplace - Tongyi Lingma | https://marketplace.visualstudio.com/items?itemName=alibaba-cloud.tongyi-lingma |
| Alibaba Cloud CLI Docs | https://www.alibabacloud.com/help/en/cli/ |
| OSS Documentation | https://www.alibabacloud.com/help/en/oss/ |
| Qwen Models on Hugging Face | https://huggingface.co/Qwen |
| Terraform Alibaba Provider | https://registry.terraform.io/providers/AlibabaCloud/alibabacloud/latest |

---

## Appendix A: Common CLI Commands

```powershell
# ECS (Elastic Compute Service)
aliyun ecs DescribeInstances --RegionId us-east-1
aliyun ecs CreateInstance --InstanceType ecs.t5-lc1m2.small

# OSS (Object Storage Service)
aliyun oss ls oss://my-bucket/
aliyun oss cp ./file.txt oss://my-bucket/path/

# VPC (Virtual Private Cloud)
aliyun vpc DescribeVpcs --RegionId us-east-1

# RDS (Relational Database Service)
aliyun rds DescribeDBInstances --RegionId us-east-1

# Function Compute
aliyun fc ListFunctions --ServiceName my-service --RegionId us-east-1

# Resource Orchestration Service
aliyun ros ListStacks --RegionId us-east-1
```

---

## Appendix B: Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `ALIBABA_CLOUD_ACCESS_KEY_ID` | RAM user AccessKey ID | Yes (for CLI) |
| `ALIBABA_CLOUD_ACCESS_KEY_SECRET` | RAM user AccessKey Secret | Yes (for CLI) |
| `ALIBABA_CLOUD_REGION` | Default region ID | No (default: cn-hangzhou) |
| `ALIBABA_CLOUD_PROFILE` | CLI profile name | No (default: default) |
| `DASHSCOPE_API_KEY` | DashScope API key | Yes (for AI models) |
| `DASHSCOPE_MODEL` | Default Qwen model | No (default: qwen-turbo) |
| `DASHSCOPE_BASE_URL` | API endpoint URL | No (auto-detected) |
| `OSS_BUCKET` | Default OSS bucket name | No |
| `OSS_ENDPOINT` | OSS endpoint URL | No |

---

*This document is maintained as part of the vidismart project documentation.*
*For questions or contributions, please refer to the project repository.*
