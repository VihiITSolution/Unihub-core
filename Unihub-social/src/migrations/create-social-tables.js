// Raw-SQL, idempotent table creation - same pattern as
// runCriticalMigrations() in Unihub-backend/src/server.js. Run automatically
// on every boot (see server.js) and also exposed as `npm run migrate` for an
// explicit first deploy.
const runSocialMigrations = async (sequelize) => {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      body TEXT NULL,
      media JSON NULL,
      visibility ENUM('public','followers') NOT NULL DEFAULT 'public',
      like_count INT NOT NULL DEFAULT 0,
      comment_count INT NOT NULL DEFAULT 0,
      is_deleted TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_created (user_id, created_at),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS post_likes (
      id INT PRIMARY KEY AUTO_INCREMENT,
      post_id INT NOT NULL,
      user_id INT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE INDEX idx_post_user_like (post_id, user_id),
      INDEX idx_like_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS post_comments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      post_id INT NOT NULL,
      user_id INT NOT NULL,
      body TEXT NOT NULL,
      is_deleted TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_post_created (post_id, created_at),
      INDEX idx_comment_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS follows (
      id INT PRIMARY KEY AUTO_INCREMENT,
      follower_id INT NOT NULL,
      following_id INT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE INDEX idx_follower_following (follower_id, following_id),
      INDEX idx_following (following_id),
      CONSTRAINT chk_no_self_follow CHECK (follower_id <> following_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

module.exports = runSocialMigrations;

if (require.main === module) {
  require("dotenv").config();
  const sequelize = require("../config/sequelize");
  runSocialMigrations(sequelize)
    .then(() => {
      console.log("Social tables ready.");
      return sequelize.close();
    })
    .catch((err) => {
      console.error("Social migration failed:", err.message);
      process.exit(1);
    });
}
