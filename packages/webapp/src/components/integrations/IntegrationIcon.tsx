import { Database } from 'lucide-react';

interface IntegrationIconProps {
  type: string;
  className?: string;
}

// Map integration types to their logo paths
const INTEGRATION_LOGOS: Record<string, string> = {
  'splunk': '/logos/splunk.png',
  'splunk-mock': '/logos/splunk.png',
};

export function IntegrationIcon({ type, className = 'h-5 w-5' }: IntegrationIconProps) {
  const logoPath = INTEGRATION_LOGOS[type];

  if (logoPath) {
    return (
      <img
        src={logoPath}
        alt={`${type} logo`}
        className={className}
        style={{ objectFit: 'contain' }}
      />
    );
  }

  // Default icon for unknown integration types
  return <Database className={className} />;
}

export function getIntegrationDisplayName(type: string): string {
  switch (type) {
    case 'splunk':
      return 'Splunk';
    case 'splunk-mock':
      return 'Splunk (Mock)';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
