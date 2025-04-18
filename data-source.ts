import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const AppDataSource = new DataSource({
  type: process.env.DB_TYPE as any, // Cast to 'any' because TypeORM expects a specific type
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10), // Default to 5432 if DB_PORT is undefined
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  synchronize: process.env.DB_SYNCHRONIZE === 'true', // Convert string to boolean
});

export default AppDataSource;