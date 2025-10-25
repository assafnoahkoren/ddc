import https from 'https';
import { getConfig } from '@ddc/config';

// Get typed configuration
const config = getConfig();
const splunkConfig = config.splunk;

interface SplunkEvent {
  time?: number;
  host?: string;
  source?: string;
  sourcetype?: string;
  index?: string;
  event: any;
}

async function sendToSplunk(event: SplunkEvent): Promise<void> {
  const data = JSON.stringify(event);

  const options = {
    hostname: splunkConfig.host,
    port: splunkConfig.port,
    path: splunkConfig.hecEndpoint,
    method: 'POST',
    headers: {
      'Authorization': `Splunk ${splunkConfig.token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    },
    rejectUnauthorized: false // Set to true in production with valid SSL cert
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('Successfully sent to Splunk:', responseBody);
          resolve();
        } else {
          console.error('Failed to send to Splunk:', res.statusCode, responseBody);
          reject(new Error(`Splunk returned status ${res.statusCode}: ${responseBody}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error sending to Splunk:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  // Configuration is automatically validated by @ddc/config
  console.log(`Environment: ${config.environment}`);
  console.log(`Splunk Host: ${splunkConfig.host}`);
  console.log(`Log Level: ${config.logLevel}`);

  const exampleEvent: SplunkEvent = {
    time: Math.floor(Date.now() / 1000),
    host: 'data-pumper',
    source: 'example-source',
    sourcetype: '_json',
    event: {
      message: 'Example log entry',
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

  try {
    await sendToSplunk(exampleEvent);
    console.log('Data pump completed successfully');
  } catch (error) {
    console.error('Data pump failed:', error);
    process.exit(1);
  }
}

main();
