import { getConfig } from '@ddc/config';
import { SplunkSDK, SplunkEvent } from './splunk-sdk';
import {
  generateSysmonProcessCreation,
  generateWindowsSecurity4688,
  generateSysmonBatch,
  getPhysicalSource,
} from './fake-data-generator';
import type { SysmonProcessCreationEvent, WindowsSecurity4688Event } from './physical-schemas';

async function main() {
  // Get configuration
  const config = getConfig();

  // Initialize Splunk SDK
  const splunk = new SplunkSDK(config.splunk);

  console.log(`Environment: ${config.environment}`);
  console.log(`Splunk Host: ${config.splunk.host}`);
  console.log(`Log Level: ${config.logLevel}`);
  console.log('\n' + '='.repeat(80));
  console.log('Generating PHYSICAL layer fake logs for Splunk');
  console.log('='.repeat(80));

  // Example 1: Generate Sysmon Process Creation events (Physical layer)
  console.log('\n📊 Generating Sysmon Process Creation events (EventCode 1)');
  console.log('Physical Source:', getPhysicalSource('sysmon'));

  const sysmonEvents = generateSysmonBatch(5);
  const sysmonSplunkEvents: SplunkEvent<SysmonProcessCreationEvent>[] = sysmonEvents.map((event, idx) => {
    const source = getPhysicalSource('sysmon');
    return {
      time: Math.floor(Date.now() / 1000) + idx,
      host: `WIN-SERVER0${(idx % 2) + 1}`,
      source: source.source,
      sourcetype: source.sourcetype,
      index: source.index,
      event,
    };
  });

  console.log(`\nSample Sysmon event (Physical schema):`);
  console.log(JSON.stringify(sysmonSplunkEvents[0], null, 2));

  // Example 2: Generate Windows Security 4688 events (Physical layer)
  console.log('\n📊 Generating Windows Security 4688 events (Process Creation)');
  console.log('Physical Source:', getPhysicalSource('winsec4688'));

  const winSecEvent = generateWindowsSecurity4688();
  const source4688 = getPhysicalSource('winsec4688');
  const winSecSplunkEvent: SplunkEvent<WindowsSecurity4688Event> = {
    time: Math.floor(Date.now() / 1000),
    host: 'DC01',
    source: source4688.source,
    sourcetype: source4688.sourcetype,
    index: source4688.index,
    event: winSecEvent,
  };

  console.log(`\nSample Windows Security 4688 event (Physical schema):`);
  console.log(JSON.stringify(winSecSplunkEvent, null, 2));

  try {
    // Send Sysmon events batch
    console.log(`\n\n🚀 Sending ${sysmonSplunkEvents.length} Sysmon events to Splunk...`);
    const sysmonResponse = await splunk.sendEvents(sysmonSplunkEvents);
    console.log(`✓ Sysmon events sent successfully (${sysmonResponse.code}):`, sysmonResponse.text);

    // Send Windows Security event
    console.log(`\n🚀 Sending Windows Security 4688 event to Splunk...`);
    const winSecResponse = await splunk.sendEvents(winSecSplunkEvent);
    console.log(`✓ Windows Security event sent successfully (${winSecResponse.code}):`, winSecResponse.text);

    console.log('\n' + '='.repeat(80));
    console.log('✅ Physical layer data pump completed successfully!');
    console.log('='.repeat(80));
    console.log('\n📝 Notes:');
    console.log('  - Physical events use ACTUAL Splunk field names (Image, User, UtcTime, etc.)');
    console.log('  - These differ from logical schemas (process_name, user, timestamp)');
    console.log('  - The catalog system will map physical -> logical fields');
    console.log('  - Both Sysmon and WinSec 4688 map to logical source: windows.process_creation');
  } catch (error) {
    console.error('\n❌ Data pump failed:', error);
    process.exit(1);
  }
}

main();
