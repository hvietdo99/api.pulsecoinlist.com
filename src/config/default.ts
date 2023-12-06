import { ETier } from 'src/shares/enums';
import { IConfig } from './interface';

const defaultConfig: IConfig = {
  env: (process.env.APP_ENV as any) || 'development',
  serviceName: 'api.pulsecoinlist.com',
  globalPath: '/api',
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  mongodb: {
    uri:
      process.env.MONGODB_URI ||
      'mongodb://localhost:27017/coins-indexes?retryWrites=true&w=majority&replicaSet=rs',
    autoIndex: true,
  },
  redis: {
    enabled: process.env.REDIS_ENABLED === 'true',
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
    user: process.env.REDIS_USER || '',
    password: process.env.REDIS_PASSWORD || '',
  },
  swagger: {
    title: 'PulseCoinList Stats API Service',
    description: 'The service to perform response for services',
    version: process.env.APP_VERSION || '1.0.0',
    user: process.env.SWAGGER_USER || 'admin',
    password: process.env.SWAGGER_PASSWORD || '1',
    path: 'docs/',
  },
  processor: {
    tier: (process.env.PROCESSOR_TIER as ETier) || null,
  },
};

export default defaultConfig;
