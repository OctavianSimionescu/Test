// clientsManager.js
let clients = {};

function addClient(client) {
  if (!clients[client.id]) {
    clients[client.id] = [];
  }
  clients[client.id].push(client);
}

function removeClient(id, res) {
  if (clients[id]) {
    clients[id] = clients[id].filter(client => client.res !== res);
    if (clients[id].length === 0) {
      delete clients[id];
    }
  }
}

function getClients() {
  return clients;
}

module.exports = {
  addClient,
  removeClient,
  getClients
};
