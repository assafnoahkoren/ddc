import { getConfig } from '@ddc/config';
import { SplunkSDK, SplunkEvent } from './splunk-sdk';
import {
  generateSysmonBatch,
  generateWindowsSecurity4688Batch,
  generateWindowsSecurity4696Batch,
  getPhysicalSource,
} from './fake-data-generator';
import type { SysmonProcessCreationEvent, WindowsSecurity4688Event, WindowsSecurity4696Event } from './physical-schemas';

async function main() {
  // Get configuration
  const config = getConfig();

  // Initialize Splunk SDK
  const splunk = new SplunkSDK(config.splunk);

  console.log(`Environment: ${config.environment}`);
  console.log(`Splunk Host: ${config.splunk.host}`);
  console.log(`Log Level: ${config.logLevel}`);
  console.log('\n' + '='.repeat(80));
  console.log('Generating 10,000+ PHYSICAL layer fake logs for Splunk');
  console.log('='.repeat(80));

  // Configuration for event generation
  const TOTAL_EVENTS = 10000;
  const SYSMON_COUNT = 5000;
  const WINSEC_4688_COUNT = 3000;
  const WINSEC_4696_COUNT = 2000;
  const BATCH_SIZE = 100; // Send events in batches of 100

  console.log(`\n📊 Generation plan:`);
  console.log(`  - Sysmon EventCode 1: ${SYSMON_COUNT.toLocaleString()} events`);
  console.log(`  - Windows Security 4688: ${WINSEC_4688_COUNT.toLocaleString()} events`);
  console.log(`  - Windows Security 4696 (Legacy): ${WINSEC_4696_COUNT.toLocaleString()} events`);
  console.log(`  - Total: ${TOTAL_EVENTS.toLocaleString()} events`);
  console.log(`  - Batch size: ${BATCH_SIZE} events per request\n`);

  // Generate all events
  console.log('🔧 Generating Sysmon events...');
  const sysmonEvents = generateSysmonBatch(SYSMON_COUNT);
  const sourceSysmon = getPhysicalSource('sysmon');
  const sysmonSplunkEvents: SplunkEvent<SysmonProcessCreationEvent>[] = sysmonEvents.map((event, idx) => ({
    time: Math.floor(Date.now() / 1000) - SYSMON_COUNT + idx, // Spread over time
    host: `WIN-SERVER0${(idx % 5) + 1}`,
    source: sourceSysmon.source,
    sourcetype: sourceSysmon.sourcetype,
    index: sourceSysmon.index,
    event,
  }));

  console.log('🔧 Generating Windows Security 4688 events...');
  const winSec4688Events = generateWindowsSecurity4688Batch(WINSEC_4688_COUNT);
  const source4688 = getPhysicalSource('winsec4688');
  const winSec4688SplunkEvents: SplunkEvent<WindowsSecurity4688Event>[] = winSec4688Events.map((event, idx) => ({
    time: Math.floor(Date.now() / 1000) - WINSEC_4688_COUNT + idx,
    host: `DC0${(idx % 3) + 1}`,
    source: source4688.source,
    sourcetype: source4688.sourcetype,
    index: source4688.index,
    event,
  }));

  console.log('🔧 Generating Windows Security 4696 events (Legacy)...');
  const winSec4696Events = generateWindowsSecurity4696Batch(WINSEC_4696_COUNT);
  const source4696 = getPhysicalSource('winsec4696');
  const winSec4696SplunkEvents: SplunkEvent<WindowsSecurity4696Event>[] = winSec4696Events.map((event, idx) => ({
    time: Math.floor(Date.now() / 1000) - WINSEC_4696_COUNT + idx,
    host: `WIN-LEGACY-${(idx % 2) + 1}`,
    source: source4696.source,
    sourcetype: source4696.sourcetype,
    index: source4696.index,
    event,
  }));

  // Show samples
  console.log(`\n📋 Sample Sysmon event (Physical schema):`);
  console.log(JSON.stringify(sysmonSplunkEvents[0], null, 2));

  console.log(`\n📋 Sample Windows Security 4688 event (Physical schema):`);
  console.log(JSON.stringify(winSec4688SplunkEvents[0], null, 2));

  console.log(`\n📋 Sample Windows Security 4696 event (Physical schema):`);
  console.log(JSON.stringify(winSec4696SplunkEvents[0], null, 2));

  try {
    // Send all events in batches
    console.log('\n' + '='.repeat(80));
    console.log('🚀 Starting batch upload to Splunk');
    console.log('='.repeat(80));

    let totalSent = 0;

    // Send Sysmon events in batches
    console.log(`\n📤 Sending ${SYSMON_COUNT.toLocaleString()} Sysmon events...`);
    for (let i = 0; i < sysmonSplunkEvents.length; i += BATCH_SIZE) {
      const batch = sysmonSplunkEvents.slice(i, i + BATCH_SIZE);
      await splunk.sendEvents(batch);
      totalSent += batch.length;
      process.stdout.write(`\r  Progress: ${totalSent.toLocaleString()}/${TOTAL_EVENTS.toLocaleString()} events sent`);
    }
    console.log(`\n  ✓ All Sysmon events sent successfully`);

    // Send Windows Security 4688 events in batches
    console.log(`\n📤 Sending ${WINSEC_4688_COUNT.toLocaleString()} Windows Security 4688 events...`);
    for (let i = 0; i < winSec4688SplunkEvents.length; i += BATCH_SIZE) {
      const batch = winSec4688SplunkEvents.slice(i, i + BATCH_SIZE);
      await splunk.sendEvents(batch);
      totalSent += batch.length;
      process.stdout.write(`\r  Progress: ${totalSent.toLocaleString()}/${TOTAL_EVENTS.toLocaleString()} events sent`);
    }
    console.log(`\n  ✓ All Windows Security 4688 events sent successfully`);

    // Send Windows Security 4696 events in batches
    console.log(`\n📤 Sending ${WINSEC_4696_COUNT.toLocaleString()} Windows Security 4696 events (Legacy)...`);
    for (let i = 0; i < winSec4696SplunkEvents.length; i += BATCH_SIZE) {
      const batch = winSec4696SplunkEvents.slice(i, i + BATCH_SIZE);
      await splunk.sendEvents(batch);
      totalSent += batch.length;
      process.stdout.write(`\r  Progress: ${totalSent.toLocaleString()}/${TOTAL_EVENTS.toLocaleString()} events sent`);
    }
    console.log(`\n  ✓ All Windows Security 4696 events sent successfully`);

    console.log('\n' + '='.repeat(80));
    console.log(`✅ Physical layer data pump completed successfully!`);
    console.log(`   Total events sent: ${totalSent.toLocaleString()}`);
    console.log('='.repeat(80));
    console.log('\n📝 Notes:');
    console.log('  - Physical events use ACTUAL Splunk field names (Image, User, UtcTime, etc.)');
    console.log('  - These differ from logical schemas (process_name, user, timestamp)');
    console.log('  - The catalog system will map physical -> logical fields');
    console.log('  - All three event types map to logical source: windows.process_creation');
    console.log('    * Sysmon EventCode 1: Uses Image, User, UtcTime');
    console.log('    * WinSec 4688: Uses NewProcessName, SubjectUserName, TimeCreated');
    console.log('    * WinSec 4696 (Legacy): Uses TargetProcessName, NewTokenAccountName, TimeCreated');
    console.log('\n🔍 Splunk query to view all events:');
    console.log('   index=windows-events earliest=-1h | stats count by sourcetype, EventCode');
  } catch (error) {
    console.error('\n❌ Data pump failed:', error);
    process.exit(1);
  }
}

main();
