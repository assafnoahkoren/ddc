# @ddc/server

tRPC API server for the Dynamic Data Catalog.

## Features

- 🔒 **tRPC** - End-to-end typesafe APIs
- 🔐 **Authentication** - User registration and login with bcrypt
- 🎯 **Zod validation** - Runtime type validation
- ⚡ **Express** - Fast HTTP server
- 🔄 **CORS enabled** - Cross-origin requests supported

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev -w @ddc/server
```

The server will start at `http://localhost:3000`

## API Endpoints

### Health Check

```
GET /health
```

Returns server status.

### tRPC Endpoint

```
POST /trpc
```

All tRPC procedures are accessible via this endpoint.

## Auth Module

The server includes a complete authentication module using `authService` from `@ddc/db`.

### Procedures

#### `auth.register`
Register a new user.

```typescript
{
  email: string;
  password: string; // min 8 characters
  name?: string;
}
```

#### `auth.login`
Login with email and password.

```typescript
{
  email: string;
  password: string;
}
```

#### `auth.getUser`
Get user by ID.

```typescript
{
  id: string; // UUID
}
```

#### `auth.listUsers`
List all active users.

No input required.

#### `auth.updateUser`
Update user information.

```typescript
{
  id: string; // UUID
  email?: string;
  password?: string; // min 8 characters
  name?: string;
}
```

#### `auth.deactivateUser`
Deactivate a user account.

```typescript
{
  id: string; // UUID
}
```

#### `auth.activateUser`
Activate a deactivated user account.

```typescript
{
  id: string; // UUID
}
```

## Usage Example

### Using tRPC Client

```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@ddc/server';

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
    }),
  ],
});

// Register user
const user = await client.auth.register.mutate({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe',
});

// Login
const loggedInUser = await client.auth.login.mutate({
  email: 'user@example.com',
  password: 'password123',
});

// Get user
const foundUser = await client.auth.getUser.query({
  id: user.id,
});

// List users
const users = await client.auth.listUsers.query();
```

### Using curl

```bash
# Register
curl -X POST http://localhost:3000/trpc/auth.register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'

# Login
curl -X POST http://localhost:3000/trpc/auth.login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","password":"password123"}'
```

## Environment Variables

The server uses environment variables from the workspace root `.env` file via `@ddc/config`.

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment (development/production)

Optional:
- `PORT` - Server port (default: 3000)

## Development

### Watch Mode

```bash
npm run dev -w @ddc/server
```

Auto-restarts on file changes using `tsx watch`.

### Build

```bash
npm run build -w @ddc/server
```

### Start Production

```bash
npm start -w @ddc/server
```

## Architecture

```
server/
├── src/
│   ├── routers/
│   │   ├── auth.ts       # Auth router with authService
│   │   └── index.ts      # Main app router
│   ├── trpc.ts           # tRPC configuration
│   └── index.ts          # Express server setup
├── package.json
├── tsconfig.json
└── README.md
```

## Type Safety

The server exports `AppRouter` type for use in client applications:

```typescript
import type { AppRouter } from '@ddc/server';
```

This enables full end-to-end type safety between client and server.
