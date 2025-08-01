import '@/styles/globals.css';
import 'antd/dist/reset.css';
import { Layout } from 'antd';
import type { AppProps } from 'next/app';
import MainLayout from '../components/mainLayout';
import { AuthProvider } from '../context';

const { Content } = Layout;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <MainLayout>
        <Content><Component {...pageProps} /></Content>
      </MainLayout>
    </AuthProvider>
  );
}