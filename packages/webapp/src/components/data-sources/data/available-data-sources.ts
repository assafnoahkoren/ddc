import type { DataSource } from '../../../types/data-source';

export const availableDataSources: DataSource[] = [
  {
    id: 'splunk',
    name: 'Splunk',
    icon: '/logos/splunk.png',
    integrationId: 'splunk-enterprise',
    description: 'Connect to Splunk for log analysis',
  },
];
