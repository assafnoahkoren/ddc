/**
 * Physical schema definitions for Splunk data sources
 * These represent ACTUAL data as it appears in Splunk, not logical/normalized schemas
 */

/**
 * Physical source metadata
 */
export interface PhysicalSourceMetadata {
  /** Splunk index name */
  index: string;
  /** Splunk sourcetype */
  sourcetype: string;
  /** Source identifier (e.g., log file path) */
  source?: string;
  /** Hint for logical source mapping (e.g., "windows.process_creation") */
  logicalSourceHint?: string;
  /** Event code for Windows events */
  eventCode?: number;
}

/**
 * Windows Sysmon Process Creation (EventCode 1)
 * Actual fields as they appear in Splunk
 */
export interface SysmonProcessCreationEvent {
  EventCode: 1;
  UtcTime: string;
  ProcessGuid: string;
  ProcessId: number;
  Image: string;
  CommandLine: string;
  CurrentDirectory: string;
  User: string;
  LogonGuid: string;
  LogonId: string;
  TerminalSessionId: number;
  IntegrityLevel: string;
  Hashes: string;
  ParentProcessGuid: string;
  ParentProcessId: number;
  ParentImage: string;
  ParentCommandLine: string;
}

/**
 * Windows Security Event 4688 - Process Creation
 * Actual fields as they appear in Splunk
 */
export interface WindowsSecurity4688Event {
  EventCode: 4688;
  TimeCreated: string;
  Computer: string;
  SubjectUserSid: string;
  SubjectUserName: string;
  SubjectDomainName: string;
  SubjectLogonId: string;
  NewProcessId: string;
  NewProcessName: string;
  TokenElevationType: string;
  ProcessId: string;
  CommandLine: string;
  TargetUserSid: string;
  TargetUserName: string;
  TargetDomainName: string;
  TargetLogonId: string;
  ParentProcessName: string;
  MandatoryLabel: string;
}

/**
 * Windows Security Event 4696 - A primary token was assigned to process
 * Actual fields as they appear in Splunk
 * NOTE: Deprecated in Windows 7+ but useful for legacy log simulation
 */
export interface WindowsSecurity4696Event {
  EventCode: 4696;
  TimeCreated: string;
  Computer: string;
  SubjectUserSid: string;
  SubjectUserName: string;
  SubjectDomainName: string;
  SubjectLogonId: string;
  ProcessId: string;
  ProcessName: string;
  TargetProcessId: string;
  TargetProcessName: string;
  NewTokenSecurityId: string;
  NewTokenAccountName: string;
  NewTokenAccountDomain: string;
  NewTokenLogonId: string;
}

/**
 * Physical source types
 */
export const PHYSICAL_SOURCES = {
  SYSMON_PROCESS_CREATION: {
    index: 'windows-events',
    sourcetype: 'XmlWinEventLog:Microsoft-Windows-Sysmon/Operational',
    source: 'XmlWinEventLog:Microsoft-Windows-Sysmon/Operational',
    logicalSourceHint: 'windows.process_creation',
    eventCode: 1,
  } as PhysicalSourceMetadata,

  WINDOWS_SECURITY_4688: {
    index: 'windows-events',
    sourcetype: 'WinEventLog:Security',
    source: 'WinEventLog:Security',
    logicalSourceHint: 'windows.process_creation',
    eventCode: 4688,
  } as PhysicalSourceMetadata,

  WINDOWS_SECURITY_4696: {
    index: 'windows-events',
    sourcetype: 'WinEventLog:Security',
    source: 'WinEventLog:Security',
    logicalSourceHint: 'windows.process_creation',
    eventCode: 4696,
  } as PhysicalSourceMetadata,
} as const;
