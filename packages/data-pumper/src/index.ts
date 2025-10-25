import { getConfig } from '@ddc/config';
import { SplunkSDK, SplunkEvent } from './splunk-sdk';

// Define typed event data
interface UserActionEvent {
  message: string;
  level: string;
  user_id: number;
  action: 'login' | 'logout';
  timestamp: string;
  metadata?: {
    app_version: string;
    environment: string;
  };
}

async function main() {
  // Get configuration
  const config = getConfig();

  // Initialize Splunk SDK
  const splunk = new SplunkSDK(config.splunk);

  console.log(`Environment: ${config.environment}`);
  console.log(`Splunk Host: ${config.splunk.host}`);
  console.log(`Log Level: ${config.logLevel}`);

  // Create typed events with full IntelliSense support
  const event1: SplunkEvent<UserActionEvent> = {
    time: Math.floor(Date.now() / 1000),
    host: 'data-pumper',
    source: 'example-source',
    sourcetype: '_json',
    event: {
      message: 'Example log entry - user login',
      level: config.logLevel,
      user_id: 12345,
      action: 'login',
      timestamp: new Date().toISOString(),
      metadata: {
        app_version: '1.0.0',
        environment: config.environment
      }
    }
  };

  const event2: SplunkEvent<UserActionEvent> = {
    time: Math.floor(Date.now() / 1000),
    host: 'data-pumper',
    source: 'example-source',
    sourcetype: '_json',
    event: {
      message: 'Example log entry - user logout',
      level: 'info',
      user_id: 67890,
      action: 'logout',
      timestamp: new Date().toISOString()
    }
  };

  try {
    // Send single event
    console.log('\nSending single event...');
    const response1 = await splunk.sendEvents(event1);
    console.log(`✓ Event sent successfully (${response1.code}):`, response1.text);

    // Send multiple events in one request (more efficient)
    console.log('\nSending batch of events...');
    const batchResponse = await splunk.sendEvents([event1, event2]);
    console.log(`✓ Batch sent successfully (${batchResponse.code}):`, batchResponse.text);

    console.log('\n✅ Data pump completed successfully');
  } catch (error) {
    console.error('\n❌ Data pump failed:', error);
    process.exit(1);
  }
}

main();
