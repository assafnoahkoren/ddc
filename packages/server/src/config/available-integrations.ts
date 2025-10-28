import { IntegrationStrategy, type IntegrationDefinition } from './integration-types';
import type { IntegrationType } from '../integrations/infra';

// Type that ensures the record key matches the integration definition's id
type IntegrationRegistry = {
  [K in IntegrationType]: IntegrationDefinition & { id: K };
};

// Available integrations configuration
export const availableIntegrations: IntegrationRegistry = {
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
  },
  'splunk-mock': {
    id: 'splunk-mock',
    name: 'Splunk (Mock Data)',
    description: 'Connect to Splunk using fake data for development and testing',
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
          name: 'mock-mode',
          type: 'text',
          description: 'Mock mode enabled - no real connection required',
          required: false,
          defaultValue: 'enabled',
        },
      ],
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
