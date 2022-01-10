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
import { PostResolver } from "./resolvers/PostResolver";
import cors from "cors";

(async function () {
  const PORT = 4000;

  const connection = createConnection();
  const app = express();
  var fs = require("fs");
  var https = require("https");
  
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));
  app.use(expressJwt({
    secret: process.env.JWT_SECRET as string,
    algorithms: ['HS256'],
    credentialsRequired: false
  }));
  app.use(cors());

  const httpsOptions = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert"),
  };

  const httpsServer = https.createServer(httpsOptions, app);

  const schema = await buildSchema({ 
    resolvers: [
      UserResolver,
      NotificationResolver,
      PhotoResolver,
      OfferResolver,
      CalendarResolver,
      ContactResolver,
      MessageResolver,
      NoteResolver,
      PostResolver
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
    server: httpsServer,
    path: server.graphqlPath
  });

  await server.start();
  server.applyMiddleware({ app });

  
  httpsServer.listen(PORT, () =>
    console.log(`Server is now running on https://localhost:${PORT}/graphql`)
  );
})();
