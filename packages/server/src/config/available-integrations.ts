import { IntegrationStrategy, type IntegrationDefinition } from './integration-types';
import { discoverSplunkSchema } from '../integrations/splunk/schema-discovery';

// Available integrations configuration
export const availableIntegrations: Record<string, IntegrationDefinition> = {
  'splunk': {
    id: 'splunk',
    name: 'Splunk',
    description: 'Connect to Splunk for log analysis',
    icon: '/logos/splunk.png',
    supportedStrategies: [IntegrationStrategy.API_KEY],
    configSchema: {
      name: {
        name: 'name',
        type: 'text',
        description: 'A friendly name for this connection',
        required: true,
      },
      fields: [
        {
          name: 'host',
          type: 'text',
          description: 'Splunk server hostname or IP address',
          required: true,
          defaultValue: 'https://prd-p-7hu66.splunkcloud.com'
        },
        {
          name: 'management-port',
          type: 'text',
          description: 'Splunk management port',
          required: true,
          defaultValue: '8089',
        },
        {
          name: 'api-key',
          type: 'password',
          description: 'Your Splunk API key',
          required: true,
          defaultValue: 'eyJraWQiOiJzcGx1bmsuc2VjcmV0IiwiYWxnIjoiSFM1MTIiLCJ2ZXIiOiJ2MiIsInR0eXAiOiJzdGF0aWMifQ.eyJpc3MiOiJzY19hZG1pbiBmcm9tIHNpLWktMGYwNzZhMTMzMmQ5YTczNjgiLCJzdWIiOiJzY19hZG1pbiIsImF1ZCI6ImFueSIsImlkcCI6IlNwbHVuayIsImp0aSI6ImM5ZDA3YTYzZGE4MjJmYTU2YzU3NTM3NDVjNDg1ODQ5MjZlYmE1OGQwNzNlZDA2YjhlNzZjOGVjZWUwMjg3MWQiLCJpYXQiOjE3NjE0MjI3MjIsImV4cCI6MTc2NDAxNDcyMiwibmJyIjoxNzYxNDIyNzIyfQ.hx3rqJck1PdH7UrYn0lUNUf4w9KjTtI7JeXTktsKhaZNM0L8H4zCpOnXyDFK90We96xTk5Zf2d9zGieiZ2gdQQ'
        },
      ],
    },
    onCreate: async (config) => {
      console.log('Splunk integration created with config:', {
        host: config.host,
        port: config['management-port'],
        // Don't log sensitive data like API key
      });

      // Discover Splunk schema
      const result = await discoverSplunkSchema({
        host: config.host as string,
        'management-port': config['management-port'] as string,
        'api-key': config['api-key'] as string,
      });

      console.log('Schema discovery result:', {
        success: result.success,
        indexCount: result.indexes.length,
        sourcetypeCount: result.sourcetypes.length,
        error: result.error,
      });
    },
  },
  // Future integrations can be added here
  // 'datadog': {
  //   id: 'datadog',
  //   name: 'Datadog',
  //   description: 'Monitor your infrastructure with Datadog',
  //   icon: '/logos/datadog.png',
  //   supportedStrategies: [IntegrationStrategy.API_KEY, IntegrationStrategy.OAUTH],
  //   configSchema: {
  //     fields: [
  //       {
  //         name: 'api-key',
  //         type: 'password',
  //         description: 'Your Datadog API key',
  //         required: true,
  //       },
  //     ],
  //   },
  // },
};
