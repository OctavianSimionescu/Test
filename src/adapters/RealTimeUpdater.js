// RealTimeUpdater.js
const Member = require("../models/Member");
const User = require("../models/User");
const clientManager = require("../utils/clientsManager");

class RealTimeUpdater {
  static async notifyClient(userId, projectId, event) {
    const clients = clientManager.getClients()[userId];
    if (clients) {
      clients.forEach((client) => {
        client.res.write(`data: ${event}|${projectId || 'N/A'}\n\n`);
      });
    }
  }

  static async updateClients(projectId, event) {
    if (!projectId) return;
    const projectMembers = await Member.findAll({
      where: { project_id: projectId },
    });

    projectMembers.forEach(({ user_id: userId }) => {
      this.notifyClient(userId, projectId, event);
    });
  }

  static async updateAllClients(event) {
    const users = await User.findAll();

    users.forEach(({ id: userId }) => {
      this.notifyClient(userId, null, event);
    });
  }
}

module.exports = RealTimeUpdater;
