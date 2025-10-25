# @ddc/db

Database client package for the Dynamic Data Catalog.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Prisma Client

```bash
npm run prisma:generate -w @ddc/db
```

### 3. Push Schema to Database

If you haven't run the SQL init scripts or want to sync the Prisma schema:

```bash
npm run prisma:push -w @ddc/db
```

Or use migrations:

```bash
npm run prisma:migrate -w @ddc/db
```

## Usage

### Import the Client

```typescript
import { prisma } from '@ddc/db';

// Query logical sources
const sources = await prisma.logicalSource.findMany({
  include: {
    fields: true,
  },
});

// Create a logical source
const source = await prisma.logicalSource.create({
  data: {
    name: 'windows.process_creation',
    category: 'windows',
    description: 'Windows process creation events',
  },
});

// Disconnect when done
await prisma.$disconnect();
```

### User Authentication

```typescript
import { authService } from '@ddc/db';
import bcrypt from 'bcrypt';

// Create a new user
const passwordHash = await bcrypt.hash('password123', 10);
const user = await authService.createUser({
  email: 'user@example.com',
  passwordHash,
  name: 'John Doe',
});

// Find user by email
const foundUser = await authService.findUserByEmail('user@example.com');

// Verify password
if (foundUser && await bcrypt.compare('password123', foundUser.passwordHash)) {
  await authService.updateLastLogin(foundUser.id);
  console.log('Login successful');
}

// List all active users
const activeUsers = await authService.listActiveUsers();

// Deactivate user
await authService.deactivateUser(user.id);
```

## Available Scripts

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run migrations in dev mode
- `npm run prisma:push` - Push schema to database (no migrations)
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run build` - Build TypeScript
- `npm run dev` - Watch mode

## Prisma Studio

View and edit your database with a GUI:

```bash
npm run prisma:studio -w @ddc/db
```

Opens at: http://localhost:5555

## Schema

The Prisma schema defines the catalog database structure:

### Models

- **LogicalSource** - Abstract data sources (e.g., `windows.process_creation`)
- **LogicalField** - Fields in logical schemas
- **PhysicalSource** - Actual data sources in Splunk
- **PhysicalField** - Fields as they appear in physical sources
- **FieldMapping** - Maps physical fields to logical fields
- **SourceMapping** - Maps physical sources to logical sources

## Environment

Set `DATABASE_URL` in `.env`:

```
DATABASE_URL="postgresql://ddc_user:ddc_password@localhost:15432/ddc_catalog?schema=catalog"
```

## TypeScript Types

Prisma automatically generates TypeScript types:

```typescript
import type { LogicalSource, PhysicalSource, FieldMapping } from '@ddc/db';
```

## Migrations

Create a new migration:

```bash
npm run prisma:migrate -w @ddc/db
```

This will:
1. Prompt for migration name
2. Generate SQL migration file
3. Apply migration to database
4. Regenerate Prisma Client

## Best Practices

1. **Always disconnect** when shutting down:
   ```typescript
   process.on('SIGINT', async () => {
     await prisma.$disconnect();
     process.exit(0);
   });
   ```

2. **Use transactions** for related operations:
   ```typescript
   await prisma.$transaction([
     prisma.logicalSource.create({ data: {...} }),
     prisma.logicalField.createMany({ data: [...] }),
   ]);
   ```

3. **Include relations** when needed:
   ```typescript
   const source = await prisma.logicalSource.findUnique({
     where: { name: 'windows.process_creation' },
     include: {
       fields: true,
       sourceMappings: {
         include: {
           physicalSource: true,
         },
       },
     },
   });
   ```
