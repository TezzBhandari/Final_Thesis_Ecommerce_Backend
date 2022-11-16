import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "Bhandari18@",
  database: "ecommerce",
  synchronize: true,
  logging: true,
  migrationsTableName: "migrations",
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/suscribers/**/*.ts"],
});
