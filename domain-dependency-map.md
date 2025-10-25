# Domain Dependency Map

## 7 Core Problem Domains

### 1. Integration & Connectivity Domain 🔌
**Problem**: How do we securely connect to different data sources?

**Challenges**:
- Different auth mechanisms (API keys, OAuth, SAML, etc.)
- Connection management (pooling, retries, timeouts)
- Multi-tenancy (different users, different credentials)
- Health checking & monitoring
- Credential storage & security

**Deliverables**:
- Integration config model
- Connector interface/abstraction
- Credential manager
- Connection pool/factory

---

### 2. Schema Discovery Domain 🔍
**Problem**: How do we automatically understand what data exists in a data source?

**Challenges**:
- Different backends have different metadata APIs
- Splunk: indexes, sourcetypes, fields
- Need to sample actual data (metadata often incomplete)
- Schema inference from semi-structured data (JSON, key-value)
- Performance (don't want to scan all data)
- Change detection (schemas evolve)

**Deliverables**:
- Discovery algorithms
- Sampling strategies
- Schema inference logic
- Physical schema model

---

### 3. Schema Management Domain 📋
**Problem**: How do we define, version, and manage logical schemas?

**Challenges**:
- Schema definition format (YAML? JSON? Code?)
- Versioning (schema evolution)
- Validation
- Standard taxonomies (Sigma, OCSF, ECS)
- Field types and constraints
- Relationships between schemas

**Deliverables**:
- Logical schema definition format
- Schema registry/repository
- Validation rules
- Schema versioning strategy

---

### 4. Mapping & Matching Domain 🧠
**Problem**: How do we map logical fields to physical fields?

**Challenges**:
- Field name variations (ProcessName vs process_name vs proc_name)
- Semantic matching (understanding "user" could be "username", "TargetUserName", "actor")
- Type compatibility (string vs int, date formats)
- Confidence scoring (how sure are we?)
- One-to-many mappings (one logical source → multiple physical sources)
- Many-to-one mappings (multiple physical fields → one logical field)
- Manual overrides vs auto-discovery
- Mapping validation

**Deliverables**:
- Matching algorithms (exact, fuzzy, semantic)
- Scoring mechanism
- Mapping data model
- Conflict resolution strategy

---

### 5. Query Translation Domain 🔄
**Problem**: How do we translate abstract queries to backend-specific queries?

**Challenges**:
- Query language parsing (SQL-like? Custom DSL?)
- Expression translation (WHERE clauses, operators)
- Function translation (aggregations, transformations)
- Backend-specific quirks (SPL vs SQL vs KQL)
- Query optimization
- Unsupported operations (what if backend can't do X?)

**Deliverables**:
- Query parser
- Query AST/IR (intermediate representation)
- Backend-specific query generators
- Translation rules

---

### 6. Query Execution Domain ⚡
**Problem**: How do we execute queries and return results?

**Challenges**:
- Backend API interactions
- Pagination & streaming
- Timeouts & cancellation
- Result transformation (physical → logical)
- Error handling
- Query federation (combining results from multiple sources)
- Performance & caching

**Deliverables**:
- Execution engine
- Result transformers
- Error handling strategies
- Caching layer

---

### 7. Catalog Storage & Persistence Domain 💾
**Problem**: Where and how do we store catalog metadata?

**Challenges**:
- What to store? (schemas, mappings, integration configs)
- Storage technology (RDBMS? NoSQL? Files?)
- Query patterns (lookups, searches)
- Consistency & transactions
- Versioning & history
- Backup & recovery
- Multi-tenancy isolation

**Deliverables**:
- Data models
- Storage schema
- Repository interfaces
- Query APIs

---

## Domain Flow & Dependencies

```
┌─────────────────────────────────────────────┐
│  1. Integration & Connectivity               │
│     - Manages connections to data sources    │
└──────────────┬──────────────────────────────┘
               │ uses
               ▼
┌─────────────────────────────────────────────┐
│  2. Schema Discovery                         │
│     - Discovers physical schemas             │
└──────────────┬──────────────────────────────┘
               │ produces
               ▼
┌─────────────────────────────────────────────┐
│  3. Schema Management                        │◄──── Logical schemas defined here
│     - Manages logical schemas                │
└──────────────┬──────────────────────────────┘
               │ provides to
               ▼
┌─────────────────────────────────────────────┐
│  4. Mapping & Matching                       │
│     - Creates logical ↔ physical mappings   │
└──────────────┬──────────────────────────────┘
               │ stores in
               ▼
┌─────────────────────────────────────────────┐
│  7. Catalog Storage                          │◄──── Central persistence
│     - Stores all metadata                    │
└──────────────┬──────────────────────────────┘
               │ read by
               ▼
┌─────────────────────────────────────────────┐
│  5. Query Translation                        │
│     - Translates logical → physical queries │
└──────────────┬──────────────────────────────┘
               │ generates
               ▼
┌─────────────────────────────────────────────┐
│  6. Query Execution                          │
│     - Executes & returns results             │
└─────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1 (Foundation)
**Can be built independently with mocks**

1. **Schema Management (3)** - Define logical schemas
2. **Catalog Storage (7)** - Design data models

**Why first**: These are foundational and have no external dependencies. Can use in-memory or file-based storage initially.

---

### Phase 2 (Discovery)
**Requires Phase 1**

3. **Integration & Connectivity (1)** - Connect to Splunk
4. **Schema Discovery (2)** - Discover physical schemas

**Why second**: Needs catalog to store discovered schemas. Can work independently once storage interfaces are defined.

---

### Phase 3 (Intelligence)
**Requires Phase 1 & 2**

5. **Mapping & Matching (4)** - Create mappings

**Why third**: This is the core problem. Needs both logical schemas (Phase 1) and discovered physical schemas (Phase 2).

---

### Phase 4 (User-Facing)
**Requires all previous phases**

6. **Query Translation (5)** - Translate queries
7. **Query Execution (6)** - Execute and return results

**Why last**: These are the user-facing capabilities that depend on all the infrastructure being in place.

---

## Domain Prioritization for Exercise

### Critical (Must Implement)
- ✅ **Schema Management (3)** - Core abstraction
- ✅ **Schema Discovery (2)** - Core automation
- ✅ **Mapping & Matching (4)** - Core intelligence
- ✅ **Catalog Storage (7)** - Core persistence
- ✅ **Query Translation (5)** - Core user feature

### Can Simplify
- ⚠️ **Integration & Connectivity (1)** - Just hardcode credentials for demo
- ⚠️ **Query Execution (6)** - Can mock Splunk responses or implement basic version

---

## Domain Interfaces

### Integration → Discovery
```python
interface Connector:
    def query_metadata() -> Metadata
    def sample_events(sourcetype: str, limit: int) -> List[Event]
```

### Discovery → Catalog
```python
interface DiscoveryResult:
    physical_schema: PhysicalSchema
    discovered_at: datetime
```

### Schema Management → Catalog
```python
interface LogicalSchema:
    name: str
    fields: List[Field]
    version: str
```

### Catalog → Mapping
```python
interface CatalogReader:
    def get_logical_schema(name: str) -> LogicalSchema
    def get_physical_schemas(backend: str) -> List[PhysicalSchema]
```

### Mapping → Catalog
```python
interface Mapping:
    logical_source: str
    physical_source: PhysicalSourceRef
    field_mappings: Dict[str, str]
    confidence_score: float
```

### Catalog → Query Translation
```python
interface MappingResolver:
    def resolve(logical_source: str) -> Optional[Mapping]
```

### Query Translation → Execution
```python
interface BackendQuery:
    raw_query: str
    backend_type: str
    field_mapping: Dict[str, str]  # for result transformation
```
