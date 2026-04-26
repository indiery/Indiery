import { Redirect } from 'expo-router';

export default function Index() {
  // This redirects to the root layout which handles auth and navigation
  return <Redirect href="/" />;
}