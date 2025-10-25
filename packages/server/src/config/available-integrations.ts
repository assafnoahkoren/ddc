import { IntegrationStrategy, type IntegrationDefinition } from './integration-types';

// Available integrations configuration
export const availableIntegrations: Record<string, IntegrationDefinition> = {
  'splunk': {
    id: 'splunk',
    name: 'Splunk',
    description: 'Connect to Splunk for log analysis',
    icon: '/logos/splunk.png',
    supportedStrategies: [IntegrationStrategy.API_KEY],
    configSchema: {
      fields: [
        {
          name: 'api-key',
          type: 'password',
          description: 'Your Splunk API key',
          required: true,
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
