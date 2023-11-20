const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const models = require("./models");
const cors = require("cors");
const authenticate = require("./services/authenticate");
const clientsManager = require("./utils/clientsManager");
const { connectToRabbitMQ } = require("./rabbitmq/index");
const { syncWithRedmine } = require("./rabbitmq/redmine/index");
require("dotenv").config();

const port = 3001;

const app = express();

app.use(cors());

app.get("/events", (req, res) => {
  const userId = req.query.userId; // Assuming the client sends its ID as a query parameter
  const token = req.query.token;

  // const auth = authenticate({ headers: { authorization: `Bearer ${token}` }});

  if (!userId) {
    res.status(400).send("User ID is required");
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Send a heartbeat every 30 seconds to keep the connection alive
  const heartbeatInterval = setInterval(() => {
    if (clientsManager.getClients()[userId]) {
      clientsManager.getClients()[userId].forEach(client => {
        client.res.write("data: heartbeat\n\n");
      });
    }
  }, 30000);

  clientsManager.addClient({ id: userId, res });

  req.on("close", () => {
    clientsManager.removeClient(userId, res);
    clearInterval(heartbeatInterval);
  });
});

async function startApolloServer(typeDefs, resolvers) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => {
      // Don't authenticate if it's a login operation
      if (
        req.body &&
        req.body.query &&
        !req.body.query.includes("query Login")
      ) {
        authenticate(req);
      }

      return { models, req };
    },
  });

  await server.start();

  server.applyMiddleware({ app });

  connectToRabbitMQ();
  // syncWithRedmine(); 

  await new Promise((resolve) => app.listen({ port }, resolve));
  console.log(
    `Server ready on port http://localhost:5000${server.graphqlPath}`
  );
  return { server, app };
}

startApolloServer(typeDefs, resolvers);
