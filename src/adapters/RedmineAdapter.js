// src/adapters/RedmineAdapter.js

const DataSource = require("../models/DataSource");
const Issue = require("../models/Issue");
const IssueAssignment = require("../models/IssueAssignment");
const IssueType = require("../models/IssueType");
const Member = require("../models/Member");
const MemberRole = require("../models/MemberRole");
const Project = require("../models/Project");
const Role = require("../models/Role");
const Status = require("../models/Status");
const User = require("../models/User");
const Sprint = require("../models/Sprint");
const Adapter = require("./Adapter");
const sequelize = require("../utils/db");
const { Transaction } = require("sequelize");
const clientManager = require("../utils/clientsManager");
const {
  SOURCES,
  get,
  GAP_SIZE,
  ISSUE_STATUS: ISSUE_STATUSES,
  ISSUE_TRACKERS,
  put,
  post,
  SERVER_EVENT_TYPES,
  HttpStatusCodes,
  convertRedmineHoursToSeconds,
  converToRedmineHours,
  getSupportedValueForKeyAndValue,
  JORUNAL_ACTIVITY_TYPES,
  JOURNAL_DETAIL_KEYS,
} = require("../utils/utils");
const { Op } = require("sequelize");
const FocusPeriod = require("../models/FocusPeriod");
const Journal = require("../models/Journal");
const JournalDetail = require("../models/JournalDetail");
const RealTimeUpdater = require("./RealTimeUpdater");
const JournalActivity = require("../models/JournalActivity");

class RedmineAdapter extends Adapter {
  async syncProjects() {
    return new Promise(async (resolve, reject) => {
      try {
        const projects = await this.fetchProjects();
        for (const project of projects) {
          await this.updateProject(project);
        }
        resolve();
      } catch (error) {
        console.log(error);
      }
    });
  }

  async syncIssues() {
    return new Promise(async (resolve, reject) => {
      try {
        const issues = (await this.fetchIssues()).reverse();
        for (const issue of issues) {
          await this.updateIssue(issue);
        }
        resolve();
      } catch (error) {
        console.log(error);
      }
    });
  }

  async syncIssuesJournals() {
    return new Promise(async (resolve, reject) => {
      try {
        const journals = await this.fetchIssueJournals();
        for (const journal of journals) {
          await this.updateJournal(journal);
        }
        resolve();
      } catch (error) {
        console.log(error);
      }
    });
  }

  async syncUsers() {
    return new Promise(async (resolve, reject) => {
      try {
        const users = await this.fetchUsers();
        for (const user of users) {
          const {
            id,
            login,
            firstname,
            lastname,
            mail,
            created_on,
            last_login_on,
            updated_on,
            admin,
            passwd_changed_on,
          } = user;

          const dataSourceExists = DataSource.findByPk(SOURCES.redmine);

          if (!dataSourceExists) {
            throw new Error("Data source does not exist");
          }

          const userExists = await User.findOne({ where: { external_id: id } });
          if (userExists) {
            await User.update(
              {
                username: login,
                email: mail,
                display_name: `${firstname ? firstname : ""} ${
                  lastname ? lastname : ""
                }`,
              },
              { where: { external_id: id } }
            );
          } else {
            await User.create({
              id,
              data_source_id: SOURCES.redmine,
              external_id: id,
              username: login,
              email: mail,
              display_name: `${firstname ? firstname : ""} ${
                lastname ? lastname : ""
              }`,
            });
          }
        }
        resolve();
      } catch (error) {
        console.log(error);
        resolve();
      }
    });
  }

  async syncStatuses() {
    return new Promise(async (resolve, reject) => {
      try {
        const statuses = await this.fetchStatuses();
        for (const status of statuses) {
          const { id, name } = status;

          const dataSourceExists = DataSource.findByPk(SOURCES.redmine);

          if (!dataSourceExists) {
            throw new Error("Data source does not exist");
          }

          const statusExists = await Status.findOne({ where: { id } });
          if (statusExists) {
            await Status.update(
              {
                name,
              },
              { where: { id } }
            );
          } else {
            await Status.create({
              id,
              data_source_id: SOURCES.redmine,
              name,
            });
          }
        }
        resolve();
      } catch (error) {
        resolve();
        console.log(error);
      }
    });
  }

  async syncIssueTypes() {
    return new Promise(async (resolve, reject) => {
      try {
        const trackers = await this.fetchIssueTypes();
        for (const tracker of trackers) {
          const { id, name } = tracker;

          const dataSourceExists = DataSource.findByPk(SOURCES.redmine);

          if (!dataSourceExists) {
            throw new Error("Data source does not exist");
          }

          const trackerExists = await IssueType.findOne({ where: { id } });
          if (trackerExists) {
            await IssueType.update(
              {
                name,
              },
              { where: { id } }
            );
          } else {
            await IssueType.create({
              id,
              data_source_id: SOURCES.redmine,
              name,
            });
          }
        }
        resolve();
      } catch (error) {
        console.log(error);
        resolve();
      }
    });
  }

  async syncRoles() {
    return new Promise(async (resolve, reject) => {
      try {
        const roles = await this.fetchRoles();
        for (const role of roles) {
          const { id, name } = role;

          const dataSourceExists = DataSource.findByPk(SOURCES.redmine);

          if (!dataSourceExists) {
            throw new Error("Data source does not exist");
          }

          const roleExists = await Role.findOne({ where: { id } });
          if (roleExists) {
            await Role.update(
              {
                name,
              },
              { where: { id } }
            );
          } else {
            await Role.create({
              id,
              data_source_id: SOURCES.redmine,
              name,
            });
          }
        }
        resolve();
      } catch (error) {
        console.log(error);
        resolve();
      }
    });
  }

  async syncSprints() {
    return new Promise(async (resolve, reject) => {
      try {
        const sprints = await this.fetchSprints();
        for (const sprint of sprints) {
          await this.updateSprint(sprint);
        }
        resolve();
      } catch (error) {
        console.log(error);
        resolve();
      }
    });
  }

  async syncMembers() {
    return new Promise(async (resolve, reject) => {
      try {
        const members = await this.fetchMembers();
        for (const member of members) {
          const { id, project, roles, user } = member;
          let currentMember = await Member.findOne({ where: { id } });

          const userExists = await User.findOne({ where: { id: user.id } });
          const projectExists = await Project.findOne({
            where: { id: project.id },
          });

          if (!userExists || !projectExists) {
            continue;
          }

          if (currentMember) {
            // Update member details if needed
            await Member.update(
              {
                user_id: user.id,
                project_id: project.id,
              },
              { where: { id } }
            );
          } else {
            // Create new member
            currentMember = await Member.create({
              id,
              user_id: user.id,
              project_id: project.id,
            });
          }

          // Process roles for the member
          for (const role of roles) {
            const existingRole = await MemberRole.findOne({
              where: { member_id: currentMember.id, role_id: role.id },
            });
            if (!existingRole) {
              // Create new entry in MemberRole if it doesn't exist
              await MemberRole.create({
                member_id: currentMember.id,
                role_id: role.id,
              });
            }
          }
        }
        resolve();
      } catch (error) {
        console.log(error);
        resolve();
      }
    });
  }

  async fetchProjects() {
    let offset = 0;
    const limit = 100;
    let allProjects = [];

    while (true) {
      const data = await get(
        `${process.env.REDMINE_HOST}/projects.json?key=${process.env.REDMINE_API_KEY}&limit=${limit}&offset=${offset}`,
        { "Content-Type": "application/json" }
      );

      const projects = data["projects"];
      allProjects = allProjects.concat(projects);

      // If the number of projects returned is less than the limit, break out of the loop
      if (projects.length < limit) {
        break;
      }

      // Increase the offset for the next iteration
      offset += limit;
    }
    return allProjects;
  }

  async fetchIssues() {
    let offset = 0;
    const limit = 100;
    let allIssues = [];

    while (true) {
      const data = await get(
        `${process.env.REDMINE_HOST}/issues.json?key=${process.env.REDMINE_API_KEY}&limit=${limit}&offset=${offset}`,
        { "Content-Type": "application/json" }
      );

      const issues = data["issues"];
      allIssues = allIssues.concat(issues);

      // If the number of issues returned is less than the limit, break out of the loop
      if (issues.length < limit) {
        break;
      }

      // Increase the offset for the next iteration
      offset += limit;
    }
    return allIssues;
  }

  async fetchIssueJournals() {
    let allJournals = [];
    const issues = (await Issue.findAll()).map((issue) => issue.external_id);
    for (let id of issues) {
      const data = await get(
        `${process.env.REDMINE_HOST}/issues/${+id}.json?include=journals&key=${
          process.env.REDMINE_API_KEY
        }`,
        { "Content-Type": "application/json" }
      );

      const journals = data["issue"]["journals"].map((journal) => {
        return {
          ...journal,
          details: journal.details.map((detail) => {
            return {
              ...detail,
              journal_id: journal.id,
              prop_key: detail.name,
              value: detail.new_value,
            };
          }),
          user_id: journal.user?.id,
          journalized_id: id,
          journalized_type: "Issue",
        };
      });

      allJournals = allJournals.concat(...journals);
    }
    return allJournals;
  }

  async fetchUsers() {
    const limit = 100;
    let offset = 0;
    let allUsers = [];

    while (true) {
      const data = await get(
        `${process.env.REDMINE_HOST}/users.json?key=${process.env.REDMINE_API_KEY}&limit=${limit}&offset=${offset}`,
        { "Content-Type": "application/json" }
      );

      const users = data["users"];
      allUsers = allUsers.concat(users);

      if (users.length < limit) {
        break;
      }
      offset += limit;
    }
    return allUsers;
  }

  async fetchStatuses() {
    const limit = 100;
    let offset = 0;
    let allStatuses = [];

    while (true) {
      const data = await get(
        `${process.env.REDMINE_HOST}/issue_statuses.json?key=${process.env.REDMINE_API_KEY}&limit=${limit}&offset=${offset}`,
        { "Content-Type": "application/json" }
      );

      const statuses = data["issue_statuses"];
      allStatuses = allStatuses.concat(statuses);

      if (statuses.length < limit) {
        break;
      }
      offset += limit;
    }
    return allStatuses;
  }

  async fetchIssueTypes() {
    const limit = 100;
    let offset = 0;
    let allTrackers = [];

    while (true) {
      const data = await get(
        `${process.env.REDMINE_HOST}/trackers.json?key=${process.env.REDMINE_API_KEY}&limit=${limit}&offset=${offset}`,
        { "Content-Type": "application/json" }
      );

      const trackers = data["trackers"];
      allTrackers = allTrackers.concat(trackers);

      if (trackers.length < limit) {
        break;
      }
      offset += limit;
    }
    return allTrackers;
  }

  async fetchRoles() {
    const limit = 100;
    let offset = 0;
    let allRoles = [];

    while (true) {
      const data = await get(
        `${process.env.REDMINE_HOST}/roles.json?key=${process.env.REDMINE_API_KEY}&limit=${limit}&offset=${offset}`,
        { "Content-Type": "application/json" }
      );

      const roles = data["roles"];
      allRoles = allRoles.concat(roles);

      if (roles.length < limit) {
        break;
      }
      offset += limit;
    }
    return allRoles;
  }

  async fetchMembers() {
    const limit = 100;
    let offset = 0;
    let allMembers = [];

    const projects = await Project.findAll();

    for (let project of projects) {
      while (true) {
        const data = await get(
          `${process.env.REDMINE_HOST}/projects/${project.metadata.identifier}/memberships.json?key=${process.env.REDMINE_API_KEY}&limit=${limit}&offset=${offset}`,
          { "Content-Type": "application/json" }
        );

        const members = data["memberships"];
        allMembers = allMembers.concat(members);

        if (members.length < limit) {
          break;
        }
        offset += limit;
      }
    }

    return allMembers;
  }

  async fetchSprints() {
    try {
      const limit = 100;
      let offset = 0;
      let allSprints = [];

      while (true) {
        const data = await get(
          `${process.env.REDMINE_HOST}/zzz_redmine_rabbitmq/sprints.json?key=${process.env.REDMINE_API_KEY}&limit=${limit}&offset=${offset}`,
          { "Content-Type": "application/json" }
        );

        const sprints = data["sprints"];
        allSprints = allSprints.concat(sprints);

        if (sprints.length < limit) {
          break;
        }
        offset += limit;
      }

      return allSprints;
    } catch (error) {
      console.error(error);
    }
  }

  async updateProject(project) {
    const {
      id,
      name,
      description,
      created_on,
      updated_on,
      identifier,
      status,
    } = project;

    super.updateProject({
      id,
      name,
      external_id: id,
      data_source_id: SOURCES.redmine,
      description,
      created_on,
      updated_on,
      metadata: {
        identifier,
        status,
      },
    });
  }

  async updateIssue(issue) {
    return new Promise(async (resolve, reject) => {
      try {
        await sequelize
          .transaction(
            { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
            async (t) => {
              const {
                id,
                project,
                tracker,
                status,
                priority,
                author,
                assigned_to,
                subject,
                description,
                sprint_id,
                spent_hours,
                start_date,
                due_date,
                done_ratio,
                estimated_hours,
                created_on,
                updated_on,
                closed_on,
                parent,
              } = issue;
              if (id) {
                let currentIssue = await Issue.findOne({
                  where: { external_id: id },
                  transaction: t,
                });
                if (currentIssue) {
                  await Issue.update(
                    {
                      project_id: project && project.id ? project.id : null,
                      status_id: status && status.id ? status.id : null,
                      subject,
                      description,
                      created_on,
                      updated_on,
                      sprint_id,
                      spent_time: convertRedmineHoursToSeconds(spent_hours),
                      done_ratio,
                      issue_type_id: tracker && tracker.id ? tracker.id : null,
                      parent_id: parent && parent.id ? parent.id : null,
                      estimated_time:
                        convertRedmineHoursToSeconds(estimated_hours),
                      metadata: {
                        priority,
                        assigned_to,
                        author,
                        start_date,
                        due_date,
                        closed_on,
                      },
                    },
                    { where: { external_id: id }, transaction: t }
                  );
                } else {
                  const maxPosition = await Issue.max("position");
                  const newPosition = maxPosition
                    ? maxPosition + GAP_SIZE
                    : GAP_SIZE;
                  currentIssue = await Issue.create(
                    {
                      id,
                      data_source_id: SOURCES.redmine,
                      external_id: id,
                      project_id: project && project.id ? project.id : null,
                      status_id: status && status.id ? status.id : null,
                      subject,
                      description,
                      created_on,
                      sprint_id,
                      spent_time: convertRedmineHoursToSeconds(spent_hours),
                      done_ratio,
                      updated_on,
                      position: newPosition,
                      issue_type_id: tracker && tracker.id ? tracker.id : null,
                      parent_id: parent && parent.id ? parent.id : null,
                      estimated_time:
                        convertRedmineHoursToSeconds(estimated_hours),
                      metadata: {
                        priority,
                        assigned_to,
                        author,
                        start_date,
                        due_date,
                        closed_on,
                      },
                    },
                    {
                      transaction: t,
                    }
                  );
                }

                // If the issue has an assigned_to field, update IssueAssignment
                if (assigned_to && assigned_to.id) {
                  const userExists = await User.findOne({
                    where: { external_id: assigned_to.id },
                    transaction: t,
                  });
                  if (userExists) {
                    const assignmentExists = await IssueAssignment.findOne({
                      where: {
                        issue_id: id,
                        user_id: currentIssue
                          ? currentIssue.metadata?.assigned_to?.id
                          : assigned_to.id,
                      },
                      transaction: t,
                    });

                    if (assignmentExists) {
                      await IssueAssignment.update(
                        { issue_id: id, user_id: assigned_to.id },
                        { where: { id: assignmentExists.id }, transaction: t }
                      );
                    } else {
                      await IssueAssignment.create(
                        {
                          issue_id: id,
                          user_id: assigned_to.id,
                        },
                        {
                          transaction: t,
                        }
                      );
                    }
                  }
                } else if (
                  currentIssue &&
                  currentIssue?.metadata?.assigned_to?.id
                ) {
                  const assignmentExists = await IssueAssignment.findOne({
                    where: {
                      issue_id: id,
                      user_id: currentIssue?.metadata?.assigned_to?.id,
                    },
                    transaction: t,
                  });
                  if (assignmentExists) {
                    await IssueAssignment.destroy({
                      where: { id: assignmentExists.id },
                      transaction: t,
                    });
                  }
                }
                RealTimeUpdater.updateClients(
                  currentIssue.project_id,
                  SERVER_EVENT_TYPES.UPDATE_ISSUES
                );
                resolve();
              } else {
                resolve();
                console.log(issue);
              }
            }
          )
          .catch((error) => {
            resolve();
            // handle transaction rollback (retry a few times)
          });
        // Extract relevant fields from the issue data
      } catch (error) {
        resolve();
        console.log(error);
      }
    });
  }

  async updateJournalActivity(journal, journalDetails) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!journal || !journalDetails || journalDetails.length === 0) {
          return resolve();
        }

        if (journalDetails.length > 1) {
          JournalActivity.create({
            journal_id: journal.id,
            type: JORUNAL_ACTIVITY_TYPES.UPDATE,
          });
          return resolve();
        }
        const detail = journalDetails[0];

        let activityType = JORUNAL_ACTIVITY_TYPES.CREATE;
        const { prop_key } = detail;
        switch (prop_key) {
          case JOURNAL_DETAIL_KEYS.STATUS_ID:
            activityType = JORUNAL_ACTIVITY_TYPES.STATUS_UPDATE;
            break;
          case JOURNAL_DETAIL_KEYS.TRACKER_ID:
            activityType = JORUNAL_ACTIVITY_TYPES.TRACKER_UPDATE;
            break;
          case JOURNAL_DETAIL_KEYS.ASSIGNED_TO_ID:
            activityType = JORUNAL_ACTIVITY_TYPES.ASSIGNMENT_UPDATE;
            break;
          case JOURNAL_DETAIL_KEYS.ESTIMATED_HOURS:
            activityType = JORUNAL_ACTIVITY_TYPES.ESTIMATED_HOURS_UPDATE;
            break;
          case JOURNAL_DETAIL_KEYS.SPENT_HOURS:
            activityType = JORUNAL_ACTIVITY_TYPES.SPENT_HOURS_UPDATE;
            break;
          case JOURNAL_DETAIL_KEYS.SUBJECT:
            activityType = JORUNAL_ACTIVITY_TYPES.SUBJECT_UPDATE;
            break;
          case JOURNAL_DETAIL_KEYS.DESCRIPTION:
            activityType = JORUNAL_ACTIVITY_TYPES.DESCRIPTION_UPDATE;
            break;
          case JOURNAL_DETAIL_KEYS.DONE_RATIO:
            activityType = JORUNAL_ACTIVITY_TYPES.DONE_RATIO_UPDATE;
            break;
          default:
            activityType = JORUNAL_ACTIVITY_TYPES.UPDATE;
            break;
        }

        JournalActivity.create({
          journal_id: journal.id,
          type: activityType,
        });
        return resolve();
      } catch (error) {
        console.error(error);
        return resolve();
      }
    });
  }

  async updateJournal(journal) {
    return new Promise(async (resolve, reject) => {
      const transaction = await sequelize.transaction();

      try {
        const {
          user_id,
          notes,
          created_on,
          id,
          details,
          journalized_id,
          journalized_type,
        } = journal;
        if (id) {
          const userExists = await User.findOne({
            where: { external_id: user_id },
          });

          let activityType = JORUNAL_ACTIVITY_TYPES.CREATE;

          if (!userExists) {
            await transaction.rollback();
            return resolve();
          }

          let currentJournal = await Journal.findOne({
            where: { external_id: id },
          });

          if (currentJournal) {
            activityType = JORUNAL_ACTIVITY_TYPES.UPDATE;
            await Journal.update(
              {
                created_on,
                notes,
                user_id: userExists.id, // Use the local user ID, not the external one
              },
              { where: { external_id: id }, transaction }
            );
          } else {
            currentJournal = await Journal.create(
              {
                id,
                data_source_id: SOURCES.redmine,
                journalized_type: journalized_type,
                journalized_id: journalized_id,
                external_id: id,
                created_on,
                notes,
                user_id: userExists.id, // Use the local user ID, not the external one
              },
              { transaction }
            );
          }

          // Create a new JournalActivity
          await JournalActivity.create(
            {
              journal_id: currentJournal?.id,
              type: activityType,
            },
            { transaction }
          );

          // Delete existing JournalDetails
          await JournalDetail.destroy({
            where: { journal_id: currentJournal?.id },
            transaction,
          });

          // Create new JournalDetails
          for (let detail of details) {
            const { id, journal_id, value, old_value, property, prop_key } =
              detail;
            if (property !== "attr" || !prop_key) continue;
            await JournalDetail.create(
              {
                journal_id: currentJournal?.id,
                property,
                prop_key,
                old_value: getSupportedValueForKeyAndValue(prop_key, old_value),
                value: getSupportedValueForKeyAndValue(prop_key, value),
              },
              { transaction }
            );
          }

          await this.updateJournalActivity(
            currentJournal,
            details.filter((d) => d.property === "attr")
          );
        }

        await transaction.commit();
        resolve();
      } catch (error) {
        console.error(error);
        await transaction.rollback();
        reject(error);
      }
    });
  }

  async updateMember(member) {
    return new Promise(async (resolve, reject) => {
      try {
        const { id, user_id, project_id } = member;
        let currentMember = await Member.findOne({ where: { id } });

        const userExists = await User.findOne({ where: { id: user_id } });
        const projectExists = await Project.findOne({
          where: { id: project_id },
        });

        if (!userExists || !projectExists) {
          return;
        }

        if (currentMember) {
          // Update member details if needed
          await Member.update(
            {
              user_id,
              project_id,
            },
            { where: { id } }
          );
        } else {
          // Create new member
          currentMember = await Member.create({
            id,
            user_id,
            project_id,
          });
        }

        RealTimeUpdater.updateClients(
          currentMember.project_id,
          SERVER_EVENT_TYPES.UPDATE_MEMBERS
        );
        resolve();
      } catch (error) {
        resolve();
        console.log(error);
      }
    });
  }

  async deleteMember(member) {
    return new Promise(async (resolve, reject) => {
      try {
        const { id, project_id } = member;
        if (id) {
          await MemberRole.destroy({ where: { member_id: id } });
          await Member.destroy({ where: { id } });
        }
        RealTimeUpdater.updateClients(
          project_id,
          SERVER_EVENT_TYPES.UPDATE_MEMBERS
        );
        resolve();
      } catch (error) {
        resolve();
        console.error(error);
      }
    });
  }

  async updateSprint(sprint) {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          id,
          name,
          project_id,
          sprint_end_date,
          sprint_start_date,
          status,
          updated_on,
          user_id,
          is_product_backlog,
          description,
          created_on,
          shared,
        } = sprint;

        const dataSourceExists = await DataSource.findByPk(SOURCES.redmine);

        if (!dataSourceExists) {
          throw new Error("Data source does not exist");
        }

        let currentSprint = await Sprint.findOne({
          where: { external_id: id },
        });
        if (currentSprint) {
          await Sprint.update(
            {
              name,
              start_date: sprint_start_date,
              end_date: sprint_end_date,
              description: description,
              project_id
            },
            { where: { external_id: id } }
          );
        } else {
          currentSprint = await Sprint.create({
            id,
            data_source_id: SOURCES.redmine,
            external_id: id,
            name,
            start_date: sprint_start_date,
            end_date: sprint_end_date,
            description: description,
            project_id
          });
        }
        RealTimeUpdater.updateClients(
          currentSprint.project_id,
          SERVER_EVENT_TYPES.UPDATE_SPRINTS
        );
        resolve();
      } catch (error) {
        resolve();
        console.log(error);
      }
    });
  }

  async deleteIssue(issue) {
    return new Promise(async (resolve, reject) => {
      try {
        const { id, project_id } = issue;
        if (id) {
          // First, delete assignments related to the issue
          await IssueAssignment.destroy({ where: { issue_id: id } });

          // Then, delete the issue itself
          await Issue.destroy({ where: { external_id: id } });
        }
        RealTimeUpdater.updateClients(
          project_id,
          SERVER_EVENT_TYPES.UPDATE_ISSUES
        );
        resolve();
      } catch (error) {
        resolve(); // Consider if you want to resolve or reject on error
        console.error(error);
      }
    });
  }

  async deleteProject(project) {
    return new Promise(async (resolve, reject) => {
      try {
        const { id } = project;
        if (id) {
          await Project.destroy({ where: { external_id: id } });
        }
        RealTimeUpdater.updateClients(id, SERVER_EVENT_TYPES.UPDATE_PROJECTS);
        resolve();
      } catch (error) {
        resolve();
        console.error(error);
      }
    });
  }

  async deleteSprint(sprint) {
    return new Promise(async (resolve, reject) => {
      try {
        const { id, project_id } = sprint;
        if (id) {
          await Sprint.destroy({ where: { external_id: id } });
        }
        RealTimeUpdater.updateClients(
          project_id,
          SERVER_EVENT_TYPES.UPDATE_SPRINTS
        );
        resolve();
      } catch (error) {
        resolve();
        console.error(error);
      }
    });
  }

  async createRedmineIssue(issue) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await post(
          `${process.env.REDMINE_HOST}/zzz_redmine_rabbitmq/issues.json?key=${process.env.REDMINE_API_KEY}`,
          {
            issue: {
              ...issue,
              tracker_id: issue?.issue_type_id,
              assigned_to_id: issue?.metadata?.assigned_to?.id,
              parent_issue_id: issue?.parent_id,
              estimated_hours: converToRedmineHours(issue?.estimated_time),
            },
          },
          {
            "Content-Type": "application/json",
          }
        );
        resolve(response);
      } catch (error) {
        resolve(null);
        console.log(error);
      }
    });
  }

  async createIssueOnSource(issue) {
    return new Promise(async (resolve, reject) => {
      try {
        const parsedIssue = JSON.parse(issue);
        const response = await this.createRedmineIssue(parsedIssue);
        if (
          response?.status === HttpStatusCodes.CREATED ||
          response?.status === HttpStatusCodes.OK
        ) {
          // If we have spent time, comment and notes, create a time entry
          if (
            parsedIssue?.spent_time > 0 &&
            parsedIssue?.metadata?.comment !== undefined &&
            parsedIssue?.metadata?.comment !== ""
          ) {
            const responseIssue = response?.data?.issue;
            const teResponse = await this.createTimeEntry({
              ...parsedIssue,
              id: responseIssue.id,
            });
            if (
              teResponse?.status === HttpStatusCodes.CREATED ||
              teResponse?.status === HttpStatusCodes.OK
            ) {
              resolve({
                message: "Issue created succesfuly",
                status: response.status,
                update: false,
                issue: null,
              });
            } else {
              resolve({
                message: "Failed to create time entry",
                status: teResponse?.status,
                update: false,
                issue: null,
              });
            }
          } else {
            // If we don't have spent time, comment and notes, just create the issue
            resolve({
              message: "Issue created succesfuly",
              status: response.status,
              update: false,
              issue: null,
            });
          }
        } else {
          resolve({
            message: "Failed to create issue",
            status: response?.status,
            update: false,
            issue: null,
          });
        }
      } catch {
        console.error("Error creating issue:", error);
        resolve({
          status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
          message: "Error creating issue",
          update: false,
          issue: null,
        });
      }
    });
  }

  async updateIssueOnSource(issue) {
    return new Promise(async (resolve, reject) => {
      try {
        const parsedIssue = JSON.parse(issue);
        const response = await this.updateRedmineIssue(parsedIssue);
        if (
          response?.status === HttpStatusCodes.CREATED ||
          response?.status === HttpStatusCodes.OK
        ) {
          if (
            parsedIssue?.spent_time > 0 &&
            parsedIssue?.metadata?.comment !== undefined &&
            parsedIssue?.metadata?.comment !== ""
          ) {
            const teResponse = await this.createTimeEntry(parsedIssue);
            if (
              teResponse?.status === HttpStatusCodes.CREATED ||
              teResponse?.status === HttpStatusCodes.OK
            ) {
              resolve({
                message: "Issue updated succesfuly",
                status: response?.status,
                update: false,
                issue: null,
              });
            } else {
              resolve({
                message: "Failed to create time entry",
                status: teResponse?.status,
                update: false,
                issue: null,
              });
            }
          } else {
            resolve({
              message: "Issue updated succesfuly",
              status: response?.status,
              update: false,
              issue: null,
            });
          }
        } else {
          resolve({
            message: "Failed to create issue",
            status: response?.status,
            update: false,
            issue: null,
          });
        }
      } catch (error) {
        console.error("Error creating issue:", error);
        resolve({
          status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
          message: "Error creating issue",
          update: false,
          issue: null,
        });
      }
    });
  }

  async updateRedmineIssue(issue) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await put(
          `${
            process.env.REDMINE_HOST
          }/zzz_redmine_rabbitmq/issues/${+issue.id}.json?key=${
            process.env.REDMINE_API_KEY
          }`,
          {
            issue: {
              ...issue,
              tracker_id: issue?.issue_type_id,
              assigned_to_id: issue?.metadata?.assigned_to?.id,
              parent_issue_id: issue?.parent_id,
              estimated_hours: converToRedmineHours(issue?.estimated_time),
            },
          },
          {
            "Content-Type": "application/json",
          }
        );
        resolve(response);
      } catch (error) {
        resolve(null);
        console.log(error);
      }
    });
  }

  async createTimeEntry(issue) {
    return new Promise(async (resolve, reject) => {
      try {
        const today = new Date();

        const year = today.getFullYear(); // Get the year (4 digits)
        const month = today.getMonth() + 1; // Get the month (0-11, so add 1)
        const day = today.getDate(); // Get the day of the month

        // Ensure that single-digit months and days are padded with a leading zero
        const formattedMonth = month < 10 ? `0${month}` : month.toString();
        const formattedDay = day < 10 ? `0${day}` : day.toString();

        // Create the formatted date string "yyyy-mm-dd"
        const formattedDate = `${year}-${formattedMonth}-${formattedDay}`;

        const response = await post(
          `${process.env.REDMINE_HOST}/time_entries.json?key=${process.env.REDMINE_API_KEY}`,
          {
            time_entry: {
              issue_id: issue?.id,
              spent_on: formattedDate,
              hours: converToRedmineHours(issue?.spent_time),
              activity_id: issue?.metadata?.activity_id, //Default Development(Dev)
              comments: issue?.metadata?.comment,
              user_id: issue?.metadata?.author_id,
            },
          },
          {
            "Content-Type": "application/json",
          }
        );
        resolve(response);
      } catch (error) {
        resolve(null);
        console.log(error);
      }
    });
  }

  async getInProgressIssues(userId, issueId) {
    return new Promise(async (resolve, reject) => {
      try {
        const issues = await Issue.findAll({
          where: {
            status_id: {
              [Op.in]: [ISSUE_STATUSES["IN_PROGRESS"]],
            },
            issue_type_id: {
              [Op.notIn]: [ISSUE_TRACKERS.USER_STORY],
            },
            id: {
              [Op.not]: issueId,
            },
          },
          include: [
            {
              model: IssueAssignment,
              as: "assignments",
              where: {
                user_id: userId,
              },
            },
          ],
          order: [["position", "ASC"]],
        });
        resolve(issues);
      } catch (error) {
        console.error(error);
      }
    });
  }

  async getIssue(issueId) {
    return new Promise(async (resolve, reject) => {
      try {
        const issue = await Issue.findOne({ where: { external_id: issueId } });
        resolve(issue);
      } catch (error) {
        console.error(error);
      }
    });
  }

  async getJournals(issueId) {
    return new Promise(async (resolve, reject) => {
      try {
        const journals = await Journal.findAll({
          where: { journalized_id: issueId },
          include: [
            {
              model: JournalDetail,
              as: "details",
            },
            {
              model: JournalActivity,
              as: "activity",
            },
          ],
          order: [["created_on", "ASC"]],
        });
        resolve(journals);
      } catch (error) {
        console.error(error);
      }
    });
  }

  async getJournalsByIssueId(issueId) {
    return new Promise(async (resolve, reject) => {
      try {
        const journals = await this.getJournals(issueId);
        if (!journals || journals.length === 0) {
          resolve({
            status: HttpStatusCodes.NOT_FOUND,
            message: "Journals not found",
            journals: null,
          });
        }
        resolve({
          status: HttpStatusCodes.OK,
          message: "Journals found",
          journals: journals,
        });
      } catch (error) {
        console.error(error);
        resolve({
          status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
          message: "Error getting journals",
          journals: null,
        });
      }
    });
  }

  async updateIssueStatusOnSource(issueId, statusId, userId) {
    return new Promise(async (resolve, reject) => {
      try {
        if (+statusId === +ISSUE_STATUSES["IN_PROGRESS"]) {
          const inProgressIssues = await this.getInProgressIssues(
            userId,
            issueId
          );
          if (inProgressIssues && inProgressIssues.length > 0) {
            resolve({
              status: HttpStatusCodes.FORBIDDEN,
              message: "You have another issue in progress",
              update: false,
              issue: inProgressIssues[0],
            });
          } else {
            const response = await this.updateIssueOnSource(
              JSON.stringify({ id: issueId, status_id: statusId })
            );
            resolve(response);
          }
        } else {
          const response = await this.updateIssueOnSource(
            JSON.stringify({ id: issueId, status_id: statusId })
          );
          resolve(response);
        }
      } catch (error) {
        console.error("Error updating issue status:", error);
        resolve({
          status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
          message: "Error updating issue status",
          update: false,
          issue: null,
        });
      }
    });
  }

  async updateRedmineStoryPosition(sprintId, newOrder) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await put(
          `${process.env.REDMINE_HOST}/zzz_redmine_rabbitmq/sprints/update_pbi_position?key=${process.env.REDMINE_API_KEY}`,
          {
            sprint_id: +sprintId,
            pbis_order: [...newOrder],
          },
          {
            "Content-Type": "application/json",
          }
        );
        resolve(response);
      } catch (error) {
        resolve(null);
        console.log(error);
      }
    });
  }

  async normalizePositions() {
    return new Promise(async (resolve, reject) => {
      const issues = await Issue.findAll({ order: [["position", "ASC"]] });
      let currentPosition = GAP_SIZE; // Start with the first position

      for (const issue of issues) {
        if (issue.position === currentPosition) {
          currentPosition += GAP_SIZE;
          continue;
        } else {
          issue.position = currentPosition;
        }
        await issue.save();
        currentPosition += GAP_SIZE;
      }
      resolve();
    });
  }

  async updateStoryPosition(storyId, position) {
    return new Promise(async (resolve, reject) => {
      try {
        const story = await Issue.findByPk(storyId);

        if (!story) {
          resolve({
            status: HttpStatusCodes.NOT_FOUND,
            message: "Story not found",
          });
        }

        // Update the story position
        story.position = position;
        await story.save();

        // Check if there's another issue too close to the desired position
        const closeIssue = await Issue.findOne({
          where: {
            position: {
              [Op.between]: [position - 0.0000001, position + 0.0000001],
            },
            id: {
              [Op.ne]: storyId, // Exclude the current issue
            },
          },
        });

        if (closeIssue) {
          // If there's an issue too close, normalize the positions
          await normalizePositions();
        }

        const sprint_id = story.sprint_id;
        const project_id = story.project_id;

        if (sprint_id && project_id) {
          // Find all the stories inside the sprint
          const stories = await Issue.findAll({
            where: {
              sprint_id,
              project_id,
              issue_type_id: ISSUE_TRACKERS.USER_STORY,
            },
            order: [["position", "ASC"]],
          });
          const newOrder = stories.map((story) => story.external_id);

          RealTimeUpdater.updateClients(
            project_id,
            SERVER_EVENT_TYPES.UPDATE_STORIES
          );

          // Update the story position on source
          const response = await this.updateStoryPositionOnSource(
            sprint_id,
            newOrder
          );

          resolve(response);
        }
        resolve({
          status: HttpStatusCodes.OK,
          message: "Issue position updated successfully",
        });
      } catch (error) {
        resolve({
          status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
          message: "Error updating issue position",
        });
      }
    });
  }

  async updateStoryPositionOnSource(sprintId, newOrder) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.updateRedmineStoryPosition(
          sprintId,
          newOrder
        );

        if (
          response?.status === HttpStatusCodes.OK ||
          response?.status === HttpStatusCodes.NO_CONTENT
        ) {
          resolve({
            status: response?.status,
            message: "Story position updated successfully",
          });
        } else {
          resolve({
            status: response?.status,
            message: "Couldn't update stories position on source",
          });
        }
      } catch (error) {
        console.error(error);
        resolve({
          status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
          message: "Error updating story position",
        });
      }
    });
  }

  async updateUserStoriesPositionFromArray(newOrder) {
    return new Promise(async (resolve, reject) => {
      try {
        // 1. Fetch all issues in the newOrder array
        const issues = await Issue.findAll({
          where: { id: newOrder },
          order: [["position", "ASC"]],
        });

        // Extract their current positions into a list
        const positions = issues.map((issue) => issue.position);

        // 2. Iterate through the newOrder array
        for (let i = 0; i < newOrder.length; i++) {
          const issueId = newOrder[i];
          const newPosition = positions[i];

          // Update the position of the issue
          await Issue.update(
            { position: newPosition },
            { where: { external_id: issueId } }
          );
        }

        resolve(true);
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  }

  async getActiveIssue(userId, startDate, endDate) {
    return new Promise(async (resolve, reject) => {
      try {
        const sprints = await Sprint.findAll({
          where: {
            start_date: {
              [Op.lte]: endDate,
            },
            end_date: {
              [Op.gte]: startDate,
            },
          },
        });

        const sprintIds = sprints.map((sprint) => sprint.external_id);

        const stories = await Issue.findAll({
          where: {
            sprint_id: {
              [Op.in]: sprintIds,
            },
            issue_type_id: ISSUE_TRACKERS.USER_STORY,
          },
        });

        const storyIds = stories.map((story) => story.external_id);

        const activeIssue = await Issue.findOne({
          where: {
            status_id: ISSUE_STATUSES["IN_PROGRESS"],
            parent_id: storyIds,
          },
          include: {
            model: IssueAssignment,
            as: "assignments",
            where: {
              user_id: userId,
            },
          },
        });

        resolve({
          status: HttpStatusCodes.OK,
          message: "Active issue retrieved successfully",
          issue: activeIssue,
        });
      } catch (error) {
        console.error(error);
        resolve({
          status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
          message: "Error getting active issue",
          issue: null,
        });
      }
    });
  }

  async updateFocusPeriod(focusPeriod) {
    return new Promise(async (resolve, reject) => {
      const parsedFocusPeriod = JSON.parse(focusPeriod);
      try {
        const { id, end_date, start_date, description } = parsedFocusPeriod;
        const focusPeriodExists = await FocusPeriod.findOne({
          where: { id: id },
        });

        let response = null;
        if (focusPeriodExists) {
          await FocusPeriod.update(
            {
              start_date,
              end_date,
              description,
            },
            { where: { id } }
          );
        } else {
          response = await FocusPeriod.create({
            id,
            data_source_id: SOURCES.redmine,
            external_id: id,
            start_date: start_date,
            end_date: end_date,
            description: description,
          });
        }
        RealTimeUpdater.updateAllClients(
          SERVER_EVENT_TYPES.UPDATE_FOCUS_PERIOD
        );
        resolve({
          status: HttpStatusCodes.OK,
          message: "Focus period updated succesfuly",
        });
      } catch (error) {
        resolve({
          status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
          message: "Error updating focus period",
        });
        console.log(error);
      }
    });
  }

  async updateClients(user_id, event) {
    const clients = clientManager.getClients()[user_id];
    if (clients) {
      clients.forEach((client) => {
        client.res.write(`data: ${event}\n\n`);
      });
    }
  }

  async updateFrontendProjectsRealTime(project) {
    return new Promise(async (resolve, reject) => {
      try {
        const { id: project_id } = project;
        const projectMembers = await Member.findAll({
          where: { project_id: project_id },
        });

        projectMembers.forEach(({ user_id }) => {
          this.updateClients(user_id, SERVER_EVENT_TYPES.UPDATE_PROJECTS);
        });
        resolve();
      } catch (error) {
        reject(error);
        console.log(error);
      }
    });
  }

  async updateFrontendIssuesRealTime(issue) {
    return new Promise(async (resolve, reject) => {
      try {
        const { project_id } = issue;
        const projectMembers = await Member.findAll({
          where: { project_id: project_id },
        });
        projectMembers.forEach(({ user_id }) => {
          this.updateClients(user_id, SERVER_EVENT_TYPES.UPDATE_ISSUES);
        });
        resolve();
      } catch (error) {
        reject(error);
        console.log(error);
      }
    });
  }

  async updateFrontendMembersRealTime(member) {
    return new Promise(async (resolve, reject) => {
      try {
        const { user_id } = member;
        this.updateClients(user_id, SERVER_EVENT_TYPES.UPDATE_EVERYTHING);
        resolve();
      } catch (error) {
        reject(error);
        console.log(error);
      }
    });
  }

  async updateFrontendStoriesPositionRealTime(storyIdsArray) {
    return new Promise(async (resolve, reject) => {
      try {
        const firstStoryId = storyIdsArray.length > 0 ? storyIdsArray[0] : -1;
        const firstStory = await Issue.findOne({
          where: { external_id: firstStoryId },
        });

        if (firstStory) {
          const project_id = firstStory.project_id;
          const projectMembers = await Member.findAll({
            where: { project_id: project_id },
          });
          projectMembers.forEach(({ user_id }) => {
            this.updateClients(user_id, SERVER_EVENT_TYPES.UPDATE_ISSUES);
          });
        }

        resolve();
      } catch (error) {
        reject(error);
        console.log(error);
      }
    });
  }

  async updateFrontendSprintsRealTime(sprint) {
    return new Promise(async (resolve, reject) => {
      try {
        const { project_id } = sprint;
        const projectMembers = await Member.findAll({
          where: { project_id: project_id },
        });
        projectMembers.forEach(({ user_id }) => {
          this.updateClients(user_id, SERVER_EVENT_TYPES.UPDATE_EVERYTHING);
        });
        resolve();
      } catch (error) {
        reject(error);
        console.log(error);
      }
    });
  }

  async updateFrontendJournalRealTime(journal) {
    return new Promise(async (resolve, reject) => {
      try {
        const { user_id } = journal;
        this.updateClients(user_id, SERVER_EVENT_TYPES.UPDATE_ISSUES);
        resolve();
      } catch (error) {
        reject(error);
        console.log(error);
      }
    });
  }
}

module.exports = RedmineAdapter;
