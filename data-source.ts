import { DataSource } from 'typeorm';


const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'sahbi',
  database: 'cvdb',
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  synchronize: true,
});

export default AppDataSource;