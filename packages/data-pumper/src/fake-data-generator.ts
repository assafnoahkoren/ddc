import { randomInt, randomUUID } from 'crypto';
import { PHYSICAL_SOURCES, SysmonProcessCreationEvent, WindowsSecurity4688Event } from './physical-schemas';

/**
 * Realistic data pools for generating fake Windows events
 */
const DATA_POOLS = {
  windowsProcesses: [
    { name: 'chrome.exe', path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', args: '--new-window https://example.com' },
    { name: 'firefox.exe', path: 'C:\\Program Files\\Mozilla Firefox\\firefox.exe', args: '-url https://example.com' },
    { name: 'notepad.exe', path: 'C:\\Windows\\System32\\notepad.exe', args: 'document.txt' },
    { name: 'powershell.exe', path: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', args: '-ExecutionPolicy Bypass -File script.ps1' },
    { name: 'cmd.exe', path: 'C:\\Windows\\System32\\cmd.exe', args: '/c dir' },
    { name: 'svchost.exe', path: 'C:\\Windows\\System32\\svchost.exe', args: '-k netsvcs -p -s BITS' },
    { name: 'explorer.exe', path: 'C:\\Windows\\explorer.exe', args: '' },
    { name: 'msedge.exe', path: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', args: '--new-window' },
    { name: 'teams.exe', path: 'C:\\Users\\alice\\AppData\\Local\\Microsoft\\Teams\\current\\Teams.exe', args: '' },
    { name: 'code.exe', path: 'C:\\Program Files\\Microsoft VS Code\\Code.exe', args: '.' },
  ],

  parentProcesses: [
    { name: 'explorer.exe', path: 'C:\\Windows\\explorer.exe' },
    { name: 'services.exe', path: 'C:\\Windows\\System32\\services.exe' },
    { name: 'cmd.exe', path: 'C:\\Windows\\System32\\cmd.exe' },
    { name: 'powershell.exe', path: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe' },
    { name: 'svchost.exe', path: 'C:\\Windows\\System32\\svchost.exe' },
  ],

  users: [
    { username: 'alice', domain: 'CORP', sid: 'S-1-5-21-123456789-1234567890-123456789-1001' },
    { username: 'bob', domain: 'CORP', sid: 'S-1-5-21-123456789-1234567890-123456789-1002' },
    { username: 'SYSTEM', domain: 'NT AUTHORITY', sid: 'S-1-5-18' },
    { username: 'admin', domain: 'WORKGROUP', sid: 'S-1-5-21-987654321-9876543210-987654321-500' },
    { username: 'service_account', domain: 'CORP', sid: 'S-1-5-21-123456789-1234567890-123456789-2001' },
  ],

  hosts: [
    'WIN-SERVER01',
    'WIN-SERVER02',
    'DESKTOP-ABC123',
    'LAPTOP-XYZ789',
    'DC01',
  ],

  integrityLevels: [
    'High',
    'Medium',
    'Low',
    'System',
  ],

  directories: [
    'C:\\Windows\\System32',
    'C:\\Users\\alice\\Documents',
    'C:\\Program Files',
    'C:\\Temp',
    'C:\\Users\\bob\\Desktop',
  ],
};

/**
 * Helper to randomly select from an array
 */
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate a random GUID
 */
function generateGuid(): string {
  return `{${randomUUID().toUpperCase()}}`;
}

/**
 * Generate a timestamp in Sysmon format
 */
function generateSysmonTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace('T', ' ').replace('Z', '');
}

/**
 * Generate a timestamp in Windows Security format
 */
function generateWindowsSecurityTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Generate a fake Sysmon Process Creation event (EventCode 1)
 */
export function generateSysmonProcessCreation(): SysmonProcessCreationEvent {
  const process = randomChoice(DATA_POOLS.windowsProcesses);
  const parentProcess = randomChoice(DATA_POOLS.parentProcesses);
  const user = randomChoice(DATA_POOLS.users);
  const integrityLevel = randomChoice(DATA_POOLS.integrityLevels);
  const currentDirectory = randomChoice(DATA_POOLS.directories);

  const processId = randomInt(1000, 65535);
  const parentProcessId = randomInt(100, 999);

  return {
    EventCode: 1,
    UtcTime: generateSysmonTimestamp(),
    ProcessGuid: generateGuid(),
    ProcessId: processId,
    Image: process.path,
    CommandLine: `${process.path} ${process.args}`.trim(),
    CurrentDirectory: currentDirectory,
    User: `${user.domain}\\${user.username}`,
    LogonGuid: generateGuid(),
    LogonId: `0x${randomInt(10000, 99999).toString(16)}`,
    TerminalSessionId: randomInt(0, 5),
    IntegrityLevel: integrityLevel,
    Hashes: `SHA256=${randomUUID().replace(/-/g, '').toUpperCase()}`,
    ParentProcessGuid: generateGuid(),
    ParentProcessId: parentProcessId,
    ParentImage: parentProcess.path,
    ParentCommandLine: parentProcess.path,
  };
}

/**
 * Generate a fake Windows Security 4688 event (Process Creation)
 */
export function generateWindowsSecurity4688(): WindowsSecurity4688Event {
  const process = randomChoice(DATA_POOLS.windowsProcesses);
  const parentProcess = randomChoice(DATA_POOLS.parentProcesses);
  const user = randomChoice(DATA_POOLS.users);
  const targetUser = randomChoice(DATA_POOLS.users);
  const host = randomChoice(DATA_POOLS.hosts);

  return {
    EventCode: 4688,
    TimeCreated: generateWindowsSecurityTimestamp(),
    Computer: host,
    SubjectUserSid: user.sid,
    SubjectUserName: user.username,
    SubjectDomainName: user.domain,
    SubjectLogonId: `0x${randomInt(10000, 99999).toString(16)}`,
    NewProcessId: `0x${randomInt(1000, 65535).toString(16)}`,
    NewProcessName: process.path,
    TokenElevationType: randomChoice(['%%1936', '%%1937', '%%1938']),
    ProcessId: `0x${randomInt(100, 999).toString(16)}`,
    CommandLine: `${process.path} ${process.args}`.trim(),
    TargetUserSid: targetUser.sid,
    TargetUserName: targetUser.username,
    TargetDomainName: targetUser.domain,
    TargetLogonId: `0x${randomInt(10000, 99999).toString(16)}`,
    ParentProcessName: parentProcess.path,
    MandatoryLabel: randomChoice(['S-1-16-12288', 'S-1-16-8192', 'S-1-16-4096']),
  };
}

/**
 * Generate batch of Sysmon events
 */
export function generateSysmonBatch(count: number): SysmonProcessCreationEvent[] {
  return Array.from({ length: count }, () => generateSysmonProcessCreation());
}

/**
 * Generate batch of Windows Security events
 */
export function generateWindowsSecurity4688Batch(count: number): WindowsSecurity4688Event[] {
  return Array.from({ length: count }, () => generateWindowsSecurity4688());
}

/**
 * Get physical source metadata for event type
 */
export function getPhysicalSource(eventType: 'sysmon' | 'winsec4688') {
  switch (eventType) {
    case 'sysmon':
      return PHYSICAL_SOURCES.SYSMON_PROCESS_CREATION;
    case 'winsec4688':
      return PHYSICAL_SOURCES.WINDOWS_SECURITY_4688;
  }
}
