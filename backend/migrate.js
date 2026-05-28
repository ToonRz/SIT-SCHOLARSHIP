const pool = require('./config/db');

const columnMigrations = [
  `ALTER TABLE users ADD COLUMN application_code VARCHAR(30) UNIQUE NULL`,
  `ALTER TABLE users ADD COLUMN gender ENUM('male', 'female', 'other', 'prefer_not_say') NULL`,
  `ALTER TABLE users ADD COLUMN date_of_birth DATE NULL`,
  `ALTER TABLE users ADD COLUMN campus VARCHAR(100) DEFAULT 'บางมด'`,
  `ALTER TABLE users ADD COLUMN semester TINYINT NULL`,
  `ALTER TABLE users ADD COLUMN personal_email VARCHAR(100) NULL`,
  `ALTER TABLE users ADD COLUMN email_verified TINYINT(1) DEFAULT 0`,
  `ALTER TABLE users ADD COLUMN email_verify_token VARCHAR(64) NULL`,
  `ALTER TABLE users ADD COLUMN father_income DECIMAL(12,2) NULL`,
  `ALTER TABLE users ADD COLUMN mother_income DECIMAL(12,2) NULL`,
  `ALTER TABLE users ADD COLUMN guardian_name VARCHAR(200) NULL`,
  `ALTER TABLE users ADD COLUMN guardian_address TEXT NULL`,
  `ALTER TABLE users ADD COLUMN pdpa_consent_at TIMESTAMP NULL`,
  `ALTER TABLE applications ADD COLUMN documents JSON NULL`,
];

async function migrate() {
  for (const sql of columnMigrations) {
    try {
      await pool.query(sql);
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') {
        console.warn(`Migration skip/fail: ${err.message}`);
      }
    }
  }
}

module.exports = { migrate };

if (require.main === module) {
  migrate()
    .then(() => {
      console.log('Migration complete');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
