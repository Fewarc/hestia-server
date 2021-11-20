export = {
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: 5432,
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  synchronize: true,
  logging: false,
  ssl: { rejectUnauthorized: false },
  entities: [
    "src/models/**/*.{ts,js}"
  ],
  migrations: [
    "src/migration/**/*.{ts,js}"
  ],
  subscribers: [
    "src/subscriber/**/*.{ts,js}"
  ]
}