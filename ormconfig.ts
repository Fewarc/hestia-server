export = {
  type: "postgres",
  host: "ec2-44-198-151-32.compute-1.amazonaws.com",
  port: 5432,
  username: "bjkpjisswjakaq",
  password: "d4b24921b070e3f5b2fcb534e858dd79a5b2db666a6abc992be8e83f81a1ea8d",
  database: "d9d7vcp601ras6",
  synchronize: false,
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