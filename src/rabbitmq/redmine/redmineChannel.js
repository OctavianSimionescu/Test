const { AdapterFactory } = require("../../factories/AdapterFactory");
const { SOURCES, REDMINE_CRUD_KEYS } = require("../../utils/utils");
const {
  cruProject,
  cruIssue,
  deleteIssue,
  deleteProject,
  deleteSprint,
  cruMember,
  deleteMember,
  cruUserStories,
  cruSprints,
  cruJournal,
} = require("./redmineConsumerActions");

const createRedmineChannel = async (connection) => {
  connection.createChannel((error1, channel) => {
    if (error1) throw error1;

    const redmineExchange = "redmine.direct.durable";
    const redmineQueue = "redmine.queue.durable";

    const routingKeys = [...Object.values(REDMINE_CRUD_KEYS)];


    channel.assertExchange(redmineExchange, "direct", { durable: true });
    channel.assertQueue(redmineQueue, { durable: true });

    routingKeys.forEach((key) => {
      channel.bindQueue(redmineQueue, redmineExchange, key);
    });

    console.log(" [*] Waiting for messages in %s", redmineQueue);

    channel.on("error", (err) => {
      console.error("[AMQP] channel error", err.message);
    });

    const adapter = AdapterFactory.createAdapter(SOURCES.redmine);

    channel.prefetch(1); // Per consumer limit , 1 message at a time, so that the worker doesn't get overwhelmed with too many tasks

    channel.consume(
      redmineQueue,
      async (msg) => {
        // Depending on the routing key, you can have different processing logic
        if (msg.fields.routingKey === REDMINE_CRUD_KEYS.CRU_PROJECTS_KEY) {
          // Handle project updates
          await cruProject(msg, adapter);
          channel.ack(msg);
        } else if (msg.fields.routingKey === REDMINE_CRUD_KEYS.CRU_ISSUES_KEY) {
          // Handle issue updates
          await cruIssue(msg, adapter);
          channel.ack(msg);
        } else if (msg.fields.routingKey === REDMINE_CRUD_KEYS.CRU_SPRINTS_KEY) {
          // Handle sprint updates
          await cruSprints(msg, adapter);
          channel.ack(msg);
        } else if (msg.fields.routingKey === REDMINE_CRUD_KEYS.D_PROJECTS_KEY) {
          // Handle project delete
          await deleteProject(msg, adapter);
          channel.ack(msg);
        } else if (msg.fields.routingKey === REDMINE_CRUD_KEYS.D_ISSUES_KEY) {
          // Handle issue delete
          await deleteIssue(msg, adapter);
          channel.ack(msg);
        } else if (msg.fields.routingKey === REDMINE_CRUD_KEYS.D_SPRINTS_KEY) {
          // Handle sprint delete
          await deleteSprint(msg, adapter);
          channel.ack(msg);
        } else if (msg.fields.routingKey === REDMINE_CRUD_KEYS.CRU_MEMBERS_KEY) {
          // Handle member update
          await cruMember(msg, adapter);
          channel.ack(msg);
        } else if (msg.fields.routingKey === REDMINE_CRUD_KEYS.D_MEMBERS_KEY) {
          // Handle member delete
          await deleteMember(msg, adapter);
          channel.ack(msg);
        } else if (msg.fields.routingKey === REDMINE_CRUD_KEYS.CRU_PBIS_KEY) {
          // Handle user story update
          await cruUserStories(msg, adapter);
          channel.ack(msg);
        } else if (msg.fields.routingKey === REDMINE_CRUD_KEYS.CRU_JOURNAL_KEY) {
          // Handle user story update
          await cruJournal(msg, adapter);
          channel.ack(msg);
        }
      },
      { noAck: false }
    );
  });
};

module.exports = { createRedmineChannel };
