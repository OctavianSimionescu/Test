// src/adapters/AbstractAdapter.js

const Issue = require("../models/Issue");
const IssueAssignment = require("../models/IssueAssignment");
const Member = require("../models/Member");
const Project = require("../models/Project");
const Sprint = require("../models/Sprint");
const User = require("../models/User");
const {
  SERVER_EVENT_TYPES,
  ISSUE_STATUS,
  ISSUE_TRACKERS,
} = require("../utils/utils");
const RealTimeUpdater = require("./RealTimeUpdater");
const { Op } = require("sequelize");

class Adapter {
  constructor() {
    if (new.target === Adapter) {
      throw new TypeError("Cannot construct Adapter instances directly");
    }
  }

  async syncProjects() {
    throw new Error("You have to implement the method fetchProjects!");
  }

  async syncIssues() {
    throw new Error("You have to implement the method fetchIssues!");
  }

  async syncUsers() {
    throw new Error("You have to implement the method fetchUsers!");
  }

  async syncStatuses() {
    throw new Error("You have to implement the method fetchMembers!");
  }

  async syncRoles() {
    throw new Error("You have to implement the method fetchRoles!");
  }

  async syncIssueTypes() {
    throw new Error("You have to implement the method fetchRoles!");
  }

  async syncMembers() {
    throw new Error("You have to implement the method fetchRoles!");
  }

  async fetchProjects() {
    throw new Error("You have to implement the method fetchProjects!");
  }

  async fetchIssues() {
    throw new Error("You have to implement the method fetchIssues!");
  }

  async fetchUsers() {
    throw new Error("You have to implement the method fetchUsers!");
  }

  async fetchStatuses() {
    throw new Error("You have to implement the method fetchMembers!");
  }

  async fetchIssueTypes() {
    throw new Error("You have to implement the method fetchMembers!");
  }

  async fetchRoles() {
    throw new Error("You have to implement the method fetchRoles!");
  }

  async fetchMembers() {
    throw new Error("You have to implement the method fetchRoles!");
  }

  async fetchSprints() {
    throw new Error("You have to implement the method fetchRoles!");
  }

  async updateProject(project) {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          id,
          name,
          data_source_id,
          external_id,
          description,
          created_on,
          updated_on,
          metadata,
        } = project;

        const whereClause = external_id ? { external_id } : { id };

        const projectExists = await Project.findOne({
          where: whereClause,
        });

        if (projectExists) {
          await Project.update(
            {
              name,
              description,
              metadata,
              created_on,
              updated_on,
            },
            { where: whereClause }
          );
        } else {
          await Project.create({
            id,
            data_source_id,
            external_id,
            name,
            description,
            metadata,
            created_on,
            updated_on,
          });
        }
        resolve(
          RealTimeUpdater.updateClients(id, SERVER_EVENT_TYPES.UPDATE_PROJECTS)
        );
      } catch (error) {
        resolve();
        console.log(error);
      }
    });
  }

  async updateIssue(issue) {
    throw new Error("You have to implement the method updateIssue!");
  }

  async updateSprint(sprint) {
    throw new Error("You have to implement the method updateSprint!");
  }

  async deleteIssue(issue) {
    throw new Error("You have to implement the method deleteIssue!");
  }

  async deleteProject(project) {
    throw new Error("You have to implement the method deleteProject!");
  }

  async deleteSprint(sprint) {
    throw new Error("You have to implement the method deleteSprint!");
  }

  async createIssueOnSource(issue) {
    throw new Error("You have to implement the method createIssueOnSource!");
  }

  async updateIssueOnSource(issue) {
    throw new Error("You have to implement the method createIssueOnSource!");
  }

  async updateSourceIssueStatus(issueId, statusId) {
    throw new Error(
      "You have to implement the method updateSourceIssueStatus!"
    );
  }

  async getProject(startDate, endDate, userId, projectId) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!userId) {
          throw new Error("User ID not provided.");
        }
        const user = await User.findByPk(userId);

        if (!user) {
          throw new Error("User not found.");
        }

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

        const sprintIds = sprints.map((sprint) => sprint.id);

        if (user && user.admin) {
          // If the user is an admin, return all projects
          const project = await Project.findOne({
            where: { id: projectId },
            include: [
              {
                model: Member,
                as: "members",
                include: {
                  model: User,
                  as: "user",
                },
              },
              {
                model: Issue,
                as: "stories",
                where: {
                  issue_type_id: ISSUE_TRACKERS.USER_STORY,
                  sprint_id: { [Op.in]: sprintIds },
                },
                order: [["position", "ASC"]],
                include: [
                  {
                    model: Issue,
                    as: "issues",
                    include: {
                      model: IssueAssignment,
                      as: "assignments",
                    },
                  },
                  {
                    model: IssueAssignment,
                    as: "assignments",
                  },
                ],
              },
              {
                model: Sprint,
                as: "sprints",
                separate: true,
                where: {
                  start_date: {
                    [Op.lte]: endDate,
                  },
                  end_date: {
                    [Op.gte]: startDate,
                  },
                },
                order: [["end_date", "DESC"]],
              },
            ],
          });

          if (!project) {
            return null;
          }

          const transformedStories = project?.stories.map((story) => {
            const transformedIssues = story.issues.map((issue) => ({
              issueId: issue.id,
              issue: issue,
            }));

            return {
              storyId: story.id,
              story: {
                ...story.get(),
                issues: transformedIssues,
              },
            };
          });

          const projectEntry = {
            ...project.get(), // This will get the plain data object from the Sequelize instance
            stories: transformedStories,
            metadata: await this.getProjectMetadata(project),
          };

          return projectEntry;
        }

        const project = await Project.findOne({
          where: { id: projectId },
          include: [
            {
              model: Member,
              as: "members",
              include: {
                model: User,
                as: "user",
              },
            },
            {
              model: Issue,
              as: "stories",
              separate: true,
              where: {
                issue_type_id: ISSUE_TRACKERS.USER_STORY,
                sprint_id: { [Op.in]: sprintIds },
              },
              order: [["position", "ASC"]],
              include: [
                {
                  model: Issue,
                  as: "issues",
                  separate: true,
                  order: [["position", "ASC"]],
                  include: {
                    model: IssueAssignment,
                    as: "assignments",
                    where: { user_id: userId },
                  },
                },
                {
                  model: IssueAssignment,
                  as: "assignments",
                },
              ],
            },
            {
              model: Sprint,
              as: "sprints",
              separate: true,
              where: {
                start_date: {
                  [Op.lte]: endDate,
                },
                end_date: {
                  [Op.gte]: startDate,
                },
              },
              order: [["end_date", "DESC"]],
            },
          ],
        });

        if (!project) {
          return null;
        }

        const transformedStories = project?.stories.map((story) => {
          const transformedIssues = story.issues.map((issue) => ({
            issueId: issue.id,
            issue: issue,
          }));

          return {
            storyId: story.id,
            story: {
              ...story.get(),
              issues: transformedIssues,
            },
          };
        });

        const projectEntry = {
          ...project.get(), // This will get the plain data object from the Sequelize instance
          stories: transformedStories,
          metadata: await this.getProjectMetadata(project),
        };

        return resolve(projectEntry);
      } catch (error) {
        console.error("Error fetching projects:", error);
        return resolve(null);
      }
    });
  }

  async getProjects(startDate, endDate, userId) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!userId) {
          throw new Error("User ID not provided.");
        }
        const user = await User.findByPk(userId);

        if (!user) {
          throw new Error("User not found.");
        }

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

        const sprintIds = sprints.map((sprint) => sprint.id);

        if (user && user.admin) {
          // If the user is an admin, return all projects
          const projects = await Project.findAll({
            include: [
              {
                model: Member,
                as: "members",
                include: {
                  model: User,
                  as: "user",
                },
              },
            ],
          });

          const projectEntries = projects.map((project) => ({
            projectId: project.id,
            project,
          }));

          return projectEntries;
        }

        const memberProjects = await Member.findAll({
          where: { user_id: userId },
        });
        const projectIds = memberProjects.map((member) => member.project_id);

        const projects = await Project.findAll({
          where: { id: { [Op.in]: projectIds } },
          include: [
            {
              model: Member,
              as: "members",
              include: {
                model: User,
                as: "user",
              },
            },
            {
              model: Issue,
              as: "stories",
              separate: true,
              where: {
                issue_type_id: ISSUE_TRACKERS.USER_STORY,
                sprint_id: { [Op.in]: sprintIds },
              },
              order: [["position", "ASC"]],
              include: [
                {
                  model: Issue,
                  as: "issues",
                  separate: true,
                  order: [["position", "ASC"]],
                  include: {
                    model: IssueAssignment,
                    as: "assignments",
                    where: { user_id: userId },
                  },
                },
                {
                  model: IssueAssignment,
                  as: "assignments",
                },
              ],
            },
            {
              model: Sprint,
              as: "sprints",
              separate: true,
              where: {
                start_date: {
                  [Op.lte]: endDate,
                },
                end_date: {
                  [Op.gte]: startDate,
                },
              },
              order: [["end_date", "DESC"]],
            },
          ],
        });

        const projectEntries = await Promise.all(
          projects.map(async (project) => ({
            projectId: project.id,
            project: {
              ...project.dataValues,
              stories: null,
              metadata: await this.getProjectMetadata(project),
            },
          }))
        );

        return resolve(projectEntries);
      } catch (error) {
        console.error("Error fetching projects:", error);
        return resolve([]);
      }
    });
  }

  async getProjectMetadata(project) {
    return new Promise(async (resolve, reject) => {
      try {
        let projectMetadata = { ...project.metadata };
        if (project) {
          const storiesCount = project.stories.length;
          let NEW = 0,
            IN_PROGRESS = 0,
            RESOLVED = 0,
            ON_HOLD = 0;
          project?.stories.forEach((story) => {
            story?.issues.forEach((issue) => {
              if (issue?.issue_type_id === ISSUE_TRACKERS.USER_STORY) {
                return;
              }
              switch (issue?.status_id) {
                case ISSUE_STATUS.NEW:
                  NEW++;
                  break;
                case ISSUE_STATUS.IN_PROGRESS:
                  IN_PROGRESS++;
                  break;
                case ISSUE_STATUS.RESOLVED:
                  RESOLVED++;
                  break;
                case ISSUE_STATUS.ON_HOLD:
                  ON_HOLD++;
                  break;
                default:
                  break;
              }
            });
          });
          const issuesCount = {
            NEW,
            IN_PROGRESS,
            RESOLVED,
            ON_HOLD,
          };

          projectMetadata = {
            ...projectMetadata,
            stories: storiesCount,
            issues: issuesCount,
          };
        }
        return resolve(projectMetadata);
      } catch (error) {
        reject(error);
      }
    });
  }

  // ... other abstract methods for fetching data, syncing, etc.
}

module.exports = Adapter;
