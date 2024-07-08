var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/app.ts
var app_exports = {};
__export(app_exports, {
  app: () => app
});
module.exports = __toCommonJS(app_exports);
var import_fastify = __toESM(require("fastify"));

// src/routes/user.ts
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
async function userRoutes(app2) {
  app2.get("/", async (request, reply) => {
    try {
      const users = await knex("users").select("*");
      return { users };
    } catch (error) {
      console.error(error);
      return reply.status(404).send({ message: "Cannot retrieve users list." });
    }
  });
  app2.get("/:id", async (request, reply) => {
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
  app2.get("/details/:email", async (request, reply) => {
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
  app2.post("/newaccount", async (request, reply) => {
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
  app2.delete("/account", async (request, reply) => {
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
  app2.patch("/edit/username", async (request, reply) => {
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
  app2.patch("/edit/new-username", async (request, reply) => {
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
  app2.patch("/edit/email/:id", async (request, reply) => {
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
  app2.patch("/edit/password/:id", async (request, reply) => {
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

// src/routes/meal.ts
var import_zod3 = require("zod");
var import_crypto2 = require("crypto");

// src/middleware/check-if-session-exists.ts
var checkIfSessionExists = async (request, reply) => {
  const sessionId = request.cookies.sessionId;
  if (!sessionId) {
    return reply.status(401).send({ error: "Unauthorised access." });
  }
};

// src/routes/meal.ts
async function mealRoutes(app2) {
  app2.post("/:userId/new-meal", async (request, reply) => {
    try {
      const createMealBodySchema = import_zod3.z.object({
        title: import_zod3.z.string(),
        description: import_zod3.z.string(),
        dietCompliance: import_zod3.z.boolean()
      });
      const createMealParamsSchema = import_zod3.z.object({
        userId: import_zod3.z.string()
      });
      const { title, description, dietCompliance } = createMealBodySchema.parse(
        request.body
      );
      const { userId } = createMealParamsSchema.parse(request.params);
      let sessionId = request.cookies.sessionId;
      console.log(sessionId);
      if (!sessionId) {
        sessionId = (0, import_crypto2.randomUUID)();
        reply.setCookie("sessionId", sessionId, {
          path: "meal/:userId/new-meal",
          maxAge: 60 * 60 * 24
        });
      }
      await knex("meals").insert({
        id: (0, import_crypto2.randomUUID)(),
        user_id: userId,
        title,
        description,
        diet_compliance: dietCompliance,
        session_id: sessionId
      });
      return reply.status(201).send({ message: "Meal created." });
    } catch (error) {
      console.error(error);
      return reply.status(404).send({ message: "Cannot create a new meal at this time." });
    }
  });
  app2.get("/", async (request, reply) => {
    try {
      const meals = await knex("meals").select("*");
      if (!meals) {
        return reply.status(404).send({ message: "Cannot retrieve meals at this time." });
      }
      return { meals };
    } catch (error) {
      console.error(error);
      return reply.status(404).send({
        message: "Cannot retrieve all meals information at this time."
      });
    }
  });
  app2.get("/:mealId", async (request, reply) => {
    try {
      const viewMealParamsSchema = import_zod3.z.object({
        mealId: import_zod3.z.string()
      });
      const { mealId } = viewMealParamsSchema.parse(request.params);
      const meal = await knex("meals").select("*").where("id", mealId).first();
      if (!meal) {
        return reply.status(404).send({ message: "Meal ID does not exist." });
      }
      return { meal };
    } catch (error) {
      console.error(error);
      return reply.status(404).send({ message: "Cannot view meal information at this time." });
    }
  });
  app2.patch("/title/:mealId", async (request, reply) => {
    try {
      const editMealTitleBodySchema = import_zod3.z.object({
        newTitle: import_zod3.z.string()
      });
      const editMealTitleParamsSchema = import_zod3.z.object({
        mealId: import_zod3.z.string()
      });
      const { newTitle } = editMealTitleBodySchema.parse(request.body);
      const { mealId } = editMealTitleParamsSchema.parse(request.params);
      const mealNewTitle = await knex("meals").where("id", mealId).update("title", newTitle).returning([
        "title",
        "description",
        "date_time_consumed",
        "diet_compliance"
      ]);
      return { mealNewTitle };
    } catch (error) {
      console.error(error);
      return reply.status(404).send({ message: "Cannot edit meal title at this time." });
    }
  });
  app2.patch("/description/:mealId", async (request, reply) => {
    try {
      const editMealDescBodySchema = import_zod3.z.object({
        newDescription: import_zod3.z.string()
      });
      const editMealDescParamsSchema = import_zod3.z.object({
        mealId: import_zod3.z.string()
      });
      const { newDescription } = editMealDescBodySchema.parse(request.body);
      const { mealId } = editMealDescParamsSchema.parse(request.params);
      const mealNewDescription = await knex("meals").where("id", mealId).update("description", newDescription).returning([
        "title",
        "description",
        "date_time_consumed",
        "diet_compliance"
      ]);
      return { mealNewDescription };
    } catch (error) {
      console.error(error);
      return reply.status(404).send({ message: "Cannot edit meal description at this time." });
    }
  });
  app2.patch("/when-consumed/:mealId", async (request, reply) => {
    try {
      const editMealWhenConsumedBodySchema = import_zod3.z.object({
        newWhenConsumed: import_zod3.z.string()
      });
      const editMealWhenConsumedParamsSchema = import_zod3.z.object({
        mealId: import_zod3.z.string()
      });
      const { newWhenConsumed } = editMealWhenConsumedBodySchema.parse(
        request.body
      );
      const { mealId } = editMealWhenConsumedParamsSchema.parse(request.params);
      const mealNewWhenConsumed = await knex("meals").where("id", mealId).update("date_time_consumed", newWhenConsumed).returning([
        "title",
        "description",
        "date_time_consumed",
        "diet_compliance"
      ]);
      return { mealNewWhenConsumed };
    } catch (error) {
      console.error(error);
      return reply.status(404).send({
        message: "Cannot edit meal date & time consumed at this time."
      });
    }
  });
  app2.patch("/diet-compliance/:mealId", async (request, reply) => {
    try {
      const editMealComplianceBodySchema = import_zod3.z.object({
        newComplianceRating: import_zod3.z.number()
      });
      const editMealComplianceParamsSchema = import_zod3.z.object({
        mealId: import_zod3.z.string()
      });
      const { newComplianceRating } = editMealComplianceBodySchema.parse(
        request.body
      );
      const { mealId } = editMealComplianceParamsSchema.parse(request.params);
      const mealNewComplianceRating = await knex("meals").where("id", mealId).update("diet_compliance", newComplianceRating).returning([
        "title",
        "description",
        "date_time_consumed",
        "diet_compliance"
      ]);
      return { mealNewComplianceRating };
    } catch (error) {
      console.error(error);
      return reply.status(404).send({
        message: "Cannot edit meal diet compliance rating at this time."
      });
    }
  });
  app2.delete("/:mealId", async (request, reply) => {
    try {
      const deleteMealParamsSchema = import_zod3.z.object({
        mealId: import_zod3.z.string()
      });
      const { mealId } = deleteMealParamsSchema.parse(request.params);
      await knex("meals").where("id", mealId).del();
      return reply.status(202).send({
        message: "Meal deleted successfully."
      });
    } catch (error) {
      console.error(error);
      return reply.status(404).send({ message: "Cannot delete meal at this time." });
    }
  });
  app2.get("/all/now", { preHandler: [checkIfSessionExists] }, async () => {
    const meals = await knex("meals").select("*");
    console.log(meals);
    if (!meals) {
      return { error: "Meals not found in current session." };
    }
    return { meals };
  });
  app2.get("/all/date/:when", async (request, reply) => {
    try {
      const dateParamsSchema = import_zod3.z.object({
        when: import_zod3.z.string()
      });
      const userBodySchema = import_zod3.z.object({
        userId: import_zod3.z.string()
      });
      const { when } = dateParamsSchema.parse(request.params);
      const { userId } = userBodySchema.parse(request.body);
      console.log(when, typeof when);
      const meals = await knex("meals").select("*").where("user_id", userId).whereRaw("date_time_consumed LIKE ?", [`%${when}`]);
      if (!meals) {
        return reply.status(404).send({
          message: "Cannot retrieve meals for this date and user at this time."
        });
      }
      return meals;
    } catch (error) {
      console.error(error);
      return reply.status(404).send({ message: "Cannot view meals information at this time." });
    }
  });
  app2.get("/all/:userId", async (request, reply) => {
    try {
      const userIdParamsSchema = import_zod3.z.object({
        userId: import_zod3.z.string()
      });
      const { userId } = userIdParamsSchema.parse(request.params);
      const allMeals = await knex("meals").select("*").where("user_id", userId);
      if (!allMeals) {
        return reply.status(404).send({ message: "User ID does not exist." });
      }
      return { allMeals };
    } catch (error) {
      console.error(error);
      return reply.status(404).send({ message: "Cannot view meals information at this time." });
    }
  });
  app2.get("/all/total/:userId", async (request, reply) => {
    try {
      const userIdParamsSchema = import_zod3.z.object({
        userId: import_zod3.z.string()
      });
      const { userId } = userIdParamsSchema.parse(request.params);
      const totalMeals = await knex("meals").where("user_id", userId).count("* as totalNumber");
      if (!totalMeals) {
        return reply.status(404).send({ message: "User ID does not exist." });
      }
      const totalMealsResult = totalMeals[0];
      return totalMealsResult;
    } catch (error) {
      console.error(error);
      return reply.status(404).send({ message: "Cannot view meals information at this time." });
    }
  });
  app2.get("/all/diet-compliant/:userId", async (request, reply) => {
    try {
      const userIdParamsSchema = import_zod3.z.object({
        userId: import_zod3.z.string()
      });
      const { userId } = userIdParamsSchema.parse(request.params);
      const compliantMeals = await knex("meals").where("user_id", userId).where("diet_compliance", 1);
      if (!compliantMeals) {
        return reply.status(404).send({ message: "User ID does not exist." });
      }
      return compliantMeals;
    } catch (error) {
      console.error(error);
      return reply.status(404).send({ message: "Cannot view meals information at this time." });
    }
  });
  app2.get("/all/diet-non-compliant/:userId", async (request, reply) => {
    try {
      const userIdParamsSchema = import_zod3.z.object({
        userId: import_zod3.z.string()
      });
      const { userId } = userIdParamsSchema.parse(request.params);
      const nonCompliantMeals = await knex("meals").where("user_id", userId).where("diet_compliance", 0);
      if (!nonCompliantMeals) {
        return reply.status(404).send({ message: "User ID does not exist." });
      }
      return nonCompliantMeals;
    } catch (error) {
      console.error(error);
      return reply.status(404).send({ message: "Cannot view meals information at this time." });
    }
  });
  app2.get("/streak/:userId", async (request, reply) => {
    try {
      let streakGenerator = function(array2) {
        let streak = 0;
        let currentStreak = 0;
        array2.forEach((element) => {
          if (element === 1) {
            currentStreak++;
            streak = Math.max(streak, currentStreak);
          } else {
            currentStreak = 0;
          }
        });
        return streak;
      };
      const userIdParamsSchema = import_zod3.z.object({
        userId: import_zod3.z.string()
      });
      const { userId } = userIdParamsSchema.parse(request.params);
      const allMealsComplianceStatuses = await knex("meals").select("diet_compliance").where("user_id", userId);
      if (!allMealsComplianceStatuses) {
        return reply.status(404).send({ message: "Information not found." });
      }
      const array = allMealsComplianceStatuses.map((object) => {
        return object.diet_compliance;
      });
      const longestStreak = streakGenerator(array);
      return longestStreak;
    } catch (error) {
      console.error(error);
      return reply.status(404).send({ message: "Cannot retrieve longest streak at this time." });
    }
  });
}

// src/app.ts
var import_cookie = __toESM(require("@fastify/cookie"));
var app = (0, import_fastify.default)();
app.addHook("preHandler", async (request) => {
  console.log(`[${request.method}] ${request.url}`);
});
app.register(import_cookie.default);
app.register(userRoutes, {
  prefix: "/user"
});
app.register(mealRoutes, {
  prefix: "/meal"
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  app
});
