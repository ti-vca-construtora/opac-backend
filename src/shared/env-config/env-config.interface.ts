export interface EnvConfigInterface {
  getPort(): number;
  getDatabaseUrl(): string;
  getNodeEnv(): string;
}
