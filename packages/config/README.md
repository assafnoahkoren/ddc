# @ddc/config

Centralized typed configuration package for the DDC workspace.

## Features

- 🔒 Type-safe configuration with TypeScript
- 🌍 Environment variable management with dotenv-mono
- ✅ Automatic validation of required config
- 🎯 Singleton pattern for consistent config access
- 🏢 Workspace-wide configuration sharing

## Installation

This package is part of the DDC workspace and uses dotenv-mono for centralized environment variable management.

```bash
npm install
```

## Usage

### Basic Usage

```typescript
import { getConfig } from '@ddc/config';

// Get configuration instance (automatically loads and validates)
const config = getConfig();

// Access environment
console.log(config.environment); // 'development' | 'production' | 'test'

// Access Splunk config (using getter)
const splunkConfig = config.splunk;
console.log(splunkConfig.host);
console.log(splunkConfig.token);
console.log(splunkConfig.port);
console.log(splunkConfig.hecEndpoint);

// Access full config
const appConfig = config.all;
```

### Helper Properties

```typescript
import { getConfig } from '@ddc/config';

const config = getConfig();

// Environment checks (using getters)
config.isProduction;   // boolean
config.isDevelopment;  // boolean
config.isTest;         // boolean

// Get log level
config.logLevel;       // string
```

### Skip Validation (for testing)

```typescript
import { getConfig } from '@ddc/config';

// Skip validation if needed (not recommended for production)
const config = getConfig({ skipValidation: true });
```

### Using the Config Class Directly

```typescript
import { Config } from '@ddc/config';

const config = Config.getInstance();

// Reset instance (useful for testing)
Config.reset();
```

## Types

All configuration types are exported and can be used in your packages:

```typescript
import type { AppConfig, SplunkConfig, Environment } from '@ddc/config';

function processConfig(config: SplunkConfig) {
  // Your code here with full type safety
}
```

## Environment Variables

The package reads from the following environment variables (managed by dotenv-mono):

### Required
- `SPLUNK_TOKEN` - Splunk HEC token
- `SPLUNK_HOST` - Splunk host URL

### Optional
- `SPLUNK_PORT` - Splunk port (default: 8088)
- `SPLUNK_HEC_ENDPOINT` - HEC endpoint path (default: /services/collector/event)
- `NODE_ENV` - Environment (development, production, test)
- `LOG_LEVEL` - Logging level (default: info)

## Validation

The configuration automatically validates required fields on initialization:
- `SPLUNK_TOKEN` must be set
- `SPLUNK_HOST` must be set

If validation fails, an error is thrown with details about missing variables.

## Architecture

The package uses:
- **Singleton pattern** - Ensures one config instance across the app
- **Immutable config** - Returns frozen objects to prevent modification
- **Type safety** - Full TypeScript support with exported types
- **dotenv-mono** - Centralized environment variable management for monorepos
