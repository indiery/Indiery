// Individual (Customer) Role Colors
export const colors = {
  primary: '#7C3AED',      // Purple
  primaryLight: '#EDE9FE',
  primaryDark: '#5B21B6',
  
  // Status colors
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  info: '#1D4ED8',
  infoLight: '#DBEAFE',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  background: '#F5F5F7',
  card: '#FFFFFF',
  border: '#EBEBEB',
  
  // Text colors
  textPrimary: '#111827',
  textSecondary: '#374151',
  textMuted: '#9CA3AF',
  textLight: '#ADADAD',
  
  // Role-specific colors
  role: {
    individual: {
      primary: '#7C3AED',
      primaryLight: '#EDE9FE',
      background: 'linear-gradient(140deg, #7C3AED, #5B21B6)',
    },
    driver: {
      primary: '#059669',
      primaryLight: '#D1FAE5',
      background: 'linear-gradient(140deg, #059669, #047857)',
    },
    transporter: {
      primary: '#1D4ED8',
      primaryLight: '#DBEAFE',
      background: 'linear-gradient(140deg, #1D4ED8, #1E3A8A)',
    },
    enterprise: {
      primary: '#D97706',
      primaryLight: '#FEF3C7',
      background: 'linear-gradient(140deg, #D97706, #B45309)',
    },
    admin: {
      primary: '#DC2626',
      primaryLight: '#FEE2E2',
      background: 'linear-gradient(140deg, #DC2626, #991B1B)',
    },
  },
};

export default colors;