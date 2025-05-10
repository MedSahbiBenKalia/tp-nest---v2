import { DataSource } from 'typeorm';

// Configure DataSource for PostgreSQL
const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'mydb',
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  synchronize: true,
});

export default AppDataSource;