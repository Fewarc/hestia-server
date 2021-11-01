import "reflect-metadata";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import { PhotoResolver } from "./resolvers/PhotoResolver";

async function main() {
  const connection = await createConnection();
  const schema = await buildSchema({ 
    resolvers: [PhotoResolver]
  });
  const server = new ApolloServer({ schema })
  await server.listen(4000)
  console.log("Server has started!")
}

main();