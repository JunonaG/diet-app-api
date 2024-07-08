var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/routes/user.ts
var user_exports = {};
__export(user_exports, {
  userRoutes: () => userRoutes
});
module.exports = __toCommonJS(user_exports);
var import_zod2 = require("zod");

// src/database.ts
var import_knex = require("knex");

// src/env/index.ts
var import_config = require("dotenv/config");
var import_zod = require("zod");
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: import_zod.z.string(),
  PORT: import_zod.z.number().default(3333)
});
var _env = envSchema.safeParse(process.env);
if (!_env.success) {
  console.error(_env.error);
  throw new Error("Environment variables have not been set correctly.");
}
var env = _env.data;

// src/database.ts
var config = {
  client: "sqlite3",
  connection: {
    filename: env.DATABASE_URL
  },
  migrations: {
    extension: "ts"
  },
  useNullAsDefault: true
};
var knex = (0, import_knex.knex)(config);

// src/routes/user.ts
var import_crypto = require("crypto");
async function userRoutes(app) {
  app.get("/", async (request, reply) => {
    try {
      const users = await knex("users").select("*");
      return { users };
    } catch (error) {
      console.error(error);
      return reply.status(404).send({ message: "Cannot retrieve users list." });
    }
  });
  app.get("/:id", async (request, reply) => {
    try {
      const getUserInfoByIdSchema = import_zod2.z.object({ id: import_zod2.z.string() });
      const { id } = getUserInfoByIdSchema.parse(request.params);
      const user = await knex("users").where("id", id).first();
      if (!user) {
        return { error: "User not found" };
      }
      return user;
    } catch (error) {
      console.error(error);
      return reply.status(404).send({ message: "Cannot retrieve specified user." });
    }
  });
  app.get("/details/:email", async (request, reply) => {
    try {
      const getUserInfoByEmailSchema = import_zod2.z.object({ email: import_zod2.z.string() });
      const { email } = getUserInfoByEmailSchema.parse(request.params);
      const user = await knex("users").where("email", email).first();
      if (!user) {
        return { error: "User not found" };
      }
      return user;
    } catch (error) {
      console.error(error);
      return reply.status(404).send({ message: "Cannot retrieve specified user by provided email." });
    }
  });
  app.post("/newaccount", async (request, reply) => {
    try {
      const createUserBodySchema = import_zod2.z.object({
        username: import_zod2.z.string(),
        email: import_zod2.z.string(),
        password: import_zod2.z.string()
      });
      const { username, email, password } = createUserBodySchema.parse(
        request.body
      );
      await knex("users").insert({
        id: (0, import_crypto.randomUUID)(),
        username,
        email,
        password
      });
      return reply.status(201).send({ message: "User account created." });
    } catch (error) {
      console.error(error);
      return reply.status(404).send({ message: "Cannot create new account at this time." });
    }
  });
  app.delete("/account", async (request, reply) => {
    try {
      const deleteUserByUsernameSchema = import_zod2.z.object({
        username: import_zod2.z.string()
      });
      const { username } = deleteUserByUsernameSchema.parse(request.body);
      const response = await knex("users").where("username", username).del();
      console.log(response);
      return reply.status(202).send({ message: "User deleted successfully." });
    } catch (error) {
      console.error(error);
      return reply.status(404).send({ message: "Cannot delete user at this time." });
    }
  });
  app.patch("/edit/username", async (request, reply) => {
    try {
      const editUsernameSchema = import_zod2.z.object({
        newUsername: import_zod2.z.string(),
        email: import_zod2.z.string()
      });
      const { newUsername, email } = editUsernameSchema.parse(request.body);
      const usernameToUpdate = await knex("users").where("email", email).first();
      if (!usernameToUpdate) {
        return reply.status(404).send({ message: "Username does not exist." });
      }
      await knex("users").where("id", usernameToUpdate.id).update({ username: newUsername });
      return reply.status(202).send({ message: "Username updated successfully." });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ message: "Failed to update username." });
    }
  });
  app.patch("/edit/new-username", async (request, reply) => {
    try {
      const editUsernameSchema = import_zod2.z.object({
        currentUsername: import_zod2.z.string(),
        newUsername: import_zod2.z.string()
      });
      const { currentUsername, newUsername } = editUsernameSchema.parse(
        request.body
      );
      const user = await knex("users").where("username", currentUsername).first();
      if (!user) {
        return reply.status(404).send({ message: "Username does not exist." });
      }
      await knex("users").where("username", user.username).update({ username: newUsername });
      return reply.status(202).send({ message: "Username updated successfully." });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ message: "Failed to update username." });
    }
  });
  app.patch("/edit/email/:id", async (request, reply) => {
    try {
      const editEmailBodySchema = import_zod2.z.object({
        newEmail: import_zod2.z.string()
      });
      const editEmailParamsSchema = import_zod2.z.object({
        id: import_zod2.z.string()
      });
      const { id } = editEmailParamsSchema.parse(request.params);
      const { newEmail } = editEmailBodySchema.parse(request.body);
      const user = await knex("users").where("id", id).first();
      if (!user) {
        return reply.status(404).send({ message: "User ID does not exist." });
      }
      await knex("users").where("id", user.id).update({ email: newEmail });
      return reply.status(202).send({ message: "Email updated successfully." });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ message: "Failed to update email." });
    }
  });
  app.patch("/edit/password/:id", async (request, reply) => {
    try {
      const editPasswordBodySchema = import_zod2.z.object({
        newPassword: import_zod2.z.string()
      });
      const editPasswordParamsSchema = import_zod2.z.object({
        id: import_zod2.z.string()
      });
      const { id } = editPasswordParamsSchema.parse(request.params);
      const { newPassword } = editPasswordBodySchema.parse(request.body);
      const user = await knex("users").where("id", id).first();
      if (!user) {
        return reply.status(404).send({ message: "User ID does not exist." });
      }
      await knex("users").where("id", user.id).update({ password: newPassword });
      return reply.status(202).send({ message: "Password updated successfully." });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ message: "Failed to update password." });
    }
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  userRoutes
});
