import https from 'https';
import type { SplunkConfig } from '@ddc/config';

/**
 * Splunk event interface with generic event data type
 */
export interface SplunkEvent<T = any> {
  time?: number;
  host?: string;
  source?: string;
  sourcetype?: string;
  index?: string;
  event: T;
}

/**
 * Splunk HEC response
 */
export interface SplunkResponse {
  text: string;
  code: number;
}

/**
 * Splunk SDK for sending events via HEC (HTTP Event Collector)
 */
export class SplunkSDK {
  private config: SplunkConfig;

  constructor(config: SplunkConfig) {
    this.config = config;
  }

  /**
   * Send one or more events to Splunk
   * Multiple events are sent in a single HTTP request (more efficient)
   */
  async sendEvents<T = any>(events: SplunkEvent<T> | SplunkEvent<T>[]): Promise<SplunkResponse> {
    // Normalize to array
    const eventsArray = Array.isArray(events) ? events : [events];

    // For HEC, we can send multiple events separated by newlines
    const data = eventsArray.map(event => JSON.stringify(event)).join('\n');

    const options = {
      hostname: this.config.host,
      port: this.config.port,
      path: this.config.hecEndpoint,
      method: 'POST',
      headers: {
        'Authorization': `Splunk ${this.config.token}`,
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
          const response: SplunkResponse = {
            text: responseBody,
            code: res.statusCode || 0
          };

          if (res.statusCode === 200) {
            resolve(response);
          } else {
            reject(new Error(`Splunk returned status ${res.statusCode}: ${responseBody}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

}
