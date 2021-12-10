require('dotenv').config()
import "reflect-metadata";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/UserResolver";
import { NotificationResolver } from "./resolvers/NotificationResolver";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { createServer } from "http";
import { execute, subscribe } from "graphql";
import express from "express";
import expressJwt from "express-jwt";
import { graphqlUploadExpress } from "graphql-upload";
import { PhotoResolver } from "./resolvers/PhotoResolver";
import { OfferResolver } from "./resolvers/OfferResolver";
import { CalendarResolver } from "./resolvers/CalendarResolver";
import { ContactResolver } from "./resolvers/ContactResolver";
import { MessageResolver } from "./resolvers/MessageResolver";
import { NoteResolver } from "./resolvers/NoteResolver";

(async function () {
  const PORT = 4000;

  const connection = createConnection();
  const app = express();
  
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));
  app.use(expressJwt({
    secret: process.env.JWT_SECRET as string,
    algorithms: ['HS256'],
    credentialsRequired: false
  }));

  const httpServer = createServer(app);

  const schema = await buildSchema({ 
    resolvers: [
      UserResolver,
      NotificationResolver,
      PhotoResolver,
      OfferResolver,
      CalendarResolver,
      ContactResolver,
      MessageResolver,
      NoteResolver
    ]
  });
  
  const server = new ApolloServer({ 
    schema,
    plugins: [{
      async serverWillStart() {
        return {
          async drainServer() {
            subscriptionServer.close();
          }
        };
      }
    }],
    context: ({ req }) => ({ req })
  });
  
  const subscriptionServer = SubscriptionServer.create({
    schema,
    execute,
    subscribe
  }, {
    server: httpServer,
    path: server.graphqlPath
  });

  await server.start();
  server.applyMiddleware({ app });

  
  httpServer.listen(PORT, () =>
    console.log(`Server is now running on http://localhost:${PORT}/graphql`)
  );
})();
