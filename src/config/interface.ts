import { ETier } from 'src/shares/enums';

export interface IConfig {
  env: 'development' | 'production';
  serviceName: string;
  globalPath: string;
  port: number;
  mongodb: {
    uri: string;
    autoIndex: boolean;
  };
  redis: {
    enabled: boolean;
    host: string;
    port: number;
    user: string;
    password: string;
  };
  swagger: {
    title: string;
    description: string;
    version: string;
    user: string;
    password: string;
    path: string;
  };
  processor: {
    tier?: ETier;
  };
}
