require("dotenv").config();

const app = require("./app");
const { sequelize } = require("./models");
const runSocialMigrations = require("./migrations/create-social-tables");

const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || "0.0.0.0";

const startServer = async () => {
  try {
    if (process.env.NODE_ENV === "production") {
      const requiredVariables = [
        "DB_HOST",
        "DB_USER",
        "DB_PASSWORD",
        "DB_NAME",
        "JWT_SECRET",
      ];
      const missingVariables = requiredVariables.filter(
        (name) => !process.env[name],
      );

      if (missingVariables.length > 0) {
        throw new Error(
          `Missing required production environment variables: ${missingVariables.join(
            ", ",
          )}`,
        );
      }
    }

    await sequelize.authenticate();
    console.log("✓ Database connection has been established successfully.");

    // Tables are created via idempotent raw SQL on every boot - this service
    // never calls sequelize.sync() since it doesn't own the `users` table
    // schema (Unihub-backend does), only the new social tables it defines.
    await runSocialMigrations(sequelize);
    console.log("✓ Social tables ready.");

    app.listen(PORT, HOST, () => {
      console.log(`Unihub Social Service is running on http://${HOST}:${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("✗ Unable to start server:", error);
    process.exit(1);
  }
};

startServer();
