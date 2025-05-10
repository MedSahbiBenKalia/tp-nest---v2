import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const AppDataSource = new DataSource({
  type: process.env.DB_TYPE || 'postgres' as any, // Cast to 'any' because TypeORM expects a specific type
  host: process.env.DB_HOST || 'localhost', // Default to 'localhost' if DB_HOST is undefined
  port: parseInt(process.env.DB_PORT || '5432', 10), // Default to 5432 if DB_PORT is undefined
  username: process.env.DB_USERNAME || 'postgres', // Default to 'postgres' if DB_USERNAME is undefined
  password: process.env.DB_PASSWORD || 'khalil2004',
  database: process.env.DB_NAME || 'cvdb',
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  synchronize: true, // Convert string to boolean
});

export default AppDataSource;