# Dynamic Data Catalog (DDC)

A framework for mapping logical data sources to physical data sources, enabling unified query interfaces across heterogeneous data systems.

## Project Structure

```
ddc/
├── packages/
│   ├── config/              # Centralized typed configuration
│   └── data-pumper/         # Fake data generator for Splunk
├── docker-compose.yml       # PostgreSQL database setup
├── init-db/                 # Database initialization scripts
└── .env                     # Environment configuration
```

## Quick Start

### 1. Start PostgreSQL Database

```bash
docker-compose up -d
```

This starts a PostgreSQL database with:
- **Host**: localhost
- **Port**: 15432
- **Database**: ddc_catalog
- **User**: ddc_user
- **Password**: ddc_password

### 2. Install Dependencies

```bash
npm install
```

### 3. Build Packages

```bash
# Build all packages
npm run build

# Or build specific package
npm run build -w @ddc/config
npm run build -w data-pumper
```

### 4. Configure Environment

Copy `.env.example` to `.env` and update with your credentials:

```bash
cp .env.example .env
```

Update Splunk credentials in `.env`:
```
SPLUNK_TOKEN=your-token-here
SPLUNK_HOST=your-host.splunkcloud.com
```

### 5. Run Data Pumper

Generate and send 10,000+ fake physical layer events to Splunk:

```bash
npm run dev -w data-pumper
```

## Database Schema

The catalog database stores mappings between logical and physical data sources:

### Tables

- **logical_sources** - Abstract data sources (e.g., `windows.process_creation`)
- **logical_fields** - Fields in logical schemas (e.g., `process_name`, `user`)
- **physical_sources** - Actual data sources in Splunk (index, sourcetype, event_code)
- **physical_fields** - Fields as they appear in physical sources (e.g., `Image`, `NewProcessName`)
- **field_mappings** - Maps physical fields to logical fields
- **source_mappings** - Maps physical sources to logical sources

### Accessing the Database

```bash
# Connect to PostgreSQL
docker exec -it ddc-postgres psql -U ddc_user -d ddc_catalog

# View schema
\dt catalog.*

# Query logical sources
SELECT * FROM catalog.logical_sources;

# Query logical fields
SELECT * FROM catalog.logical_fields;
```

## Physical Layer Data Generation

The data-pumper generates realistic Windows security events:

### Event Types Generated

1. **Sysmon EventCode 1** (5,000 events)
   - Physical fields: `Image`, `User`, `UtcTime`, `CommandLine`, `ParentImage`
   - Index: `windows-events`
   - Sourcetype: `XmlWinEventLog:Microsoft-Windows-Sysmon/Operational`

2. **Windows Security 4688** (3,000 events)
   - Physical fields: `NewProcessName`, `SubjectUserName`, `TimeCreated`
   - Index: `windows-events`
   - Sourcetype: `WinEventLog:Security`

3. **Windows Security 4696** (2,000 events - Legacy)
   - Physical fields: `TargetProcessName`, `NewTokenAccountName`, `TimeCreated`
   - Index: `windows-events`
   - Sourcetype: `WinEventLog:Security`

All three map to logical source: `windows.process_creation`

## Development

### Watch Mode

Run all packages in watch mode:

```bash
npm run dev
```

Or run specific package:

```bash
npm run dev -w @ddc/config
npm run dev -w data-pumper
```

### Stop Database

```bash
docker-compose down
```

To remove data volumes:

```bash
docker-compose down -v
```

## Splunk Queries

### View Generated Events

```spl
index=windows-events earliest=-1h
| stats count by sourcetype, EventCode
```

### Query Specific Event Type

```spl
# Sysmon events
index=windows-events sourcetype="XmlWinEventLog:Microsoft-Windows-Sysmon/Operational" EventCode=1
| table _time, Image, User, CommandLine

# Windows Security 4688
index=windows-events sourcetype="WinEventLog:Security" EventCode=4688
| table _time, NewProcessName, SubjectUserName

# Windows Security 4696 (Legacy)
index=windows-events sourcetype="WinEventLog:Security" EventCode=4696
| table _time, TargetProcessName, NewTokenAccountName
```

## Architecture

This project demonstrates:
- **Physical Layer**: Actual data with platform-specific field names
- **Logical Layer**: Abstract schemas with normalized field names
- **Catalog Mapping**: Dynamic discovery and mapping between physical and logical

The catalog enables queries like:
```
FROM windows.process_creation
WHERE process_name LIKE '%powershell%'
```

Which automatically translates to the appropriate physical queries across multiple sources.

## License

ISC
