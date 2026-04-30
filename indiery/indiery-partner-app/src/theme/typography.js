import { StyleSheet } from 'react-native';

export const typography = StyleSheet.create({
  // Headings
  h1: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '700',
  },
  h4: {
    fontSize: 18,
    fontWeight: '700',
  },
  h5: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Body text
  body: {
    fontSize: 14,
    fontWeight: '400',
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400',
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Labels
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Caption
  caption: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  captionSmall: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  
  // Button text
  button: {
    fontSize: 14,
    fontWeight: '700',
  },
  buttonSmall: {
    fontSize: 12,
    fontWeight: '700',
  },
  
  // Price/Money
  price: {
    fontSize: 18,
    fontWeight: '800',
  },
  priceLarge: {
    fontSize: 32,
    fontWeight: '800',
  },
});

export default typography;