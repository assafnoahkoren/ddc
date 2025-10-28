/**
 * Mock Splunk REST API Functions
 *
 * Provides fake responses for Splunk REST API endpoints to enable development
 * without requiring actual Splunk Cloud Platform connection.
 */

import { FieldDataType } from '@ddc/db';

// Type definitions for mock API responses
export interface DiscoveredCollection {
  name: string;
  metadata?: Record<string, unknown>;
}

export interface DiscoveredField {
  name: string;
  dataType: FieldDataType;
  metadata?: Record<string, unknown>;
}

export interface SchemaDiscoveryResult {
  collections: DiscoveredCollection[];
  success: boolean;
  error?: string;
}

export interface FieldDiscoveryResult {
  fields: DiscoveredField[];
  success: boolean;
  error?: string;
}

/**
 * Mock indexes with realistic data
 */
const MOCK_INDEXES = [
  {
    name: 'main',
    totalEventCount: '1250000',
    currentDBSizeMB: '450.5',
  },
  {
    name: 'windows-events',
    totalEventCount: '2500000',
    currentDBSizeMB: '890.3',
  },
  {
    name: 'security',
    totalEventCount: '750000',
    currentDBSizeMB: '320.8',
  },
  {
    name: 'network',
    totalEventCount: '3200000',
    currentDBSizeMB: '1200.5',
  },
  {
    name: 'web-logs',
    totalEventCount: '5000000',
    currentDBSizeMB: '2100.7',
  },
  {
    name: '_internal',
    totalEventCount: '500000',
    currentDBSizeMB: '180.2',
  },
  {
    name: '_audit',
    totalEventCount: '100000',
    currentDBSizeMB: '45.1',
  },
];

/**
 * Mock sourcetypes with realistic values
 */
const MOCK_SOURCETYPES = [
  { name: 'WinEventLog:Sysmon/Operational' },
  { name: 'WinEventLog:Security' },
  { name: 'WinEventLog:System' },
  { name: 'WinEventLog:Application' },
  { name: 'XmlWinEventLog:Microsoft-Windows-Sysmon/Operational' },
  { name: 'XmlWinEventLog:Security' },
  { name: 'syslog' },
  { name: 'cisco:asa' },
  { name: 'cisco:firepower' },
  { name: 'aws:cloudtrail' },
  { name: 'aws:s3:accesslogs' },
  { name: 'linux_secure' },
  { name: 'access_combined' },
  { name: 'iis' },
  { name: 'json' },
  { name: 'csv' },
];

/**
 * Mock fields for different collection types
 */
const MOCK_FIELDS_BY_SOURCETYPE: Record<string, string[]> = {
  'WinEventLog:Sysmon/Operational': [
    'EventCode',
    'UtcTime',
    'ProcessGuid',
    'ProcessId',
    'Image',
    'CommandLine',
    'CurrentDirectory',
    'User',
    'LogonGuid',
    'LogonId',
    'TerminalSessionId',
    'IntegrityLevel',
    'Hashes',
    'ParentProcessGuid',
    'ParentProcessId',
    'ParentImage',
    'ParentCommandLine',
    'Computer',
    'EventType',
    'RuleName',
  ],
  'WinEventLog:Security': [
    'EventCode',
    'TimeCreated',
    'Computer',
    'SubjectUserSid',
    'SubjectUserName',
    'SubjectDomainName',
    'SubjectLogonId',
    'NewProcessId',
    'NewProcessName',
    'TokenElevationType',
    'ProcessId',
    'CommandLine',
    'TargetUserSid',
    'TargetUserName',
    'TargetDomainName',
    'TargetLogonId',
    'ParentProcessName',
    'MandatoryLabel',
    'Keywords',
    'Message',
    'Level',
    'Task',
  ],
  'default': [
    '_time',
    'host',
    'source',
    'sourcetype',
    'index',
    '_raw',
    'timestamp',
    'event_type',
    'user',
    'action',
    'result',
    'duration',
    'bytes_in',
    'bytes_out',
    'src_ip',
    'dest_ip',
    'src_port',
    'dest_port',
    'protocol',
  ],
};

/**
 * Mock: Validate Splunk connection
 */
export async function mockValidateConnection(): Promise<boolean> {
  console.log('[MOCK] Validating Splunk connection...');
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('[MOCK] ✓ Connection successful (mock)');
  return true;
}

/**
 * Mock: Discover collections (index + sourcetype combinations)
 */
export async function mockDiscoverCollections(): Promise<SchemaDiscoveryResult> {
  console.log('[MOCK] Discovering Splunk collections...');

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const collections: DiscoveredCollection[] = [];

  // Create all combinations of indexes and sourcetypes
  for (const index of MOCK_INDEXES) {
    for (const sourcetype of MOCK_SOURCETYPES) {
      collections.push({
        name: `index:${index.name}, sourcetype:${sourcetype.name}`,
        metadata: {
          index: index.name,
          sourcetype: sourcetype.name,
          totalEventCount: index.totalEventCount,
          currentDBSizeMB: index.currentDBSizeMB,
        },
      });
    }
  }

  console.log(`[MOCK] ✓ Found ${MOCK_INDEXES.length} indexes and ${MOCK_SOURCETYPES.length} sourcetypes`);
  console.log(`[MOCK] ✓ Created ${collections.length} collection combinations`);

  return {
    collections,
    success: true,
  };
}

/**
 * Mock: Discover fields for a specific collection
 */
export async function mockDiscoverFields(collectionName: string): Promise<FieldDiscoveryResult> {
  console.log(`[MOCK] Discovering fields for collection: ${collectionName}`);

  // Parse collection name to extract sourcetype
  const sourcetypeMatch = collectionName.match(/sourcetype:(.+)/);
  const sourcetype = sourcetypeMatch ? sourcetypeMatch[1].trim() : '';

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Get fields for this sourcetype (or use default fields)
  const fieldNames = MOCK_FIELDS_BY_SOURCETYPE[sourcetype] || MOCK_FIELDS_BY_SOURCETYPE['default'];

  const fields: DiscoveredField[] = fieldNames.map((fieldName) => ({
    name: fieldName,
    dataType: FieldDataType.STRING, // Most fields are strings in Splunk
    metadata: {
      discoveredAt: new Date().toISOString(),
      sourcetype,
    },
  }));

  console.log(`[MOCK] ✓ Discovered ${fields.length} fields`);

  return {
    fields,
    success: true,
  };
}

/**
 * Mock: Query data from Splunk
 */
export async function mockQuery(
  collectionName: string,
  query: Record<string, unknown>
): Promise<unknown[]> {
  console.log(`[MOCK] Querying Splunk collection: ${collectionName}`);
  console.log(`[MOCK] Query parameters:`, query);

  // Parse collection name
  const indexMatch = collectionName.match(/index:([^,]+)/);
  const sourcetypeMatch = collectionName.match(/sourcetype:(.+)/);
  const index = indexMatch ? indexMatch[1].trim() : 'main';
  const sourcetype = sourcetypeMatch ? sourcetypeMatch[1].trim() : 'json';

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  // Generate mock results based on sourcetype
  const limit = (query.limit as number) || 100;
  const results: unknown[] = [];

  for (let i = 0; i < Math.min(limit, 100); i++) {
    if (sourcetype.includes('Sysmon')) {
      results.push({
        _time: new Date().toISOString(),
        host: `WIN-SERVER0${(i % 5) + 1}`,
        source: 'WinEventLog:Sysmon',
        sourcetype,
        index,
        EventCode: 1,
        Image: 'C:\\Windows\\System32\\notepad.exe',
        CommandLine: 'notepad.exe document.txt',
        User: 'CORP\\alice',
        ProcessId: 4000 + i,
        ParentProcessId: 1000 + (i % 10),
        UtcTime: new Date(Date.now() - i * 60000).toISOString(),
      });
    } else if (sourcetype.includes('Security')) {
      results.push({
        _time: new Date().toISOString(),
        host: `DC0${(i % 3) + 1}`,
        source: 'WinEventLog:Security',
        sourcetype,
        index,
        EventCode: 4688,
        SubjectUserName: 'alice',
        SubjectDomainName: 'CORP',
        NewProcessName: 'C:\\Windows\\System32\\cmd.exe',
        CommandLine: 'cmd.exe /c dir',
        NewProcessId: `0x${(4000 + i).toString(16)}`,
        TimeCreated: new Date(Date.now() - i * 60000).toISOString(),
      });
    } else {
      // Generic log entry
      results.push({
        _time: new Date().toISOString(),
        host: `host-${i % 10}`,
        source: 'generic',
        sourcetype,
        index,
        event_type: 'generic_event',
        message: `Mock event ${i}`,
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
      });
    }
  }

  console.log(`[MOCK] ✓ Query returned ${results.length} results`);

  return results;
}

/**
 * Export all mock functions
 */
export const mockSplunkRestAPI = {
  validateConnection: mockValidateConnection,
  discoverCollections: mockDiscoverCollections,
  discoverFields: mockDiscoverFields,
  query: mockQuery,
};
