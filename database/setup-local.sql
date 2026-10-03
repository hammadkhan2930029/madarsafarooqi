-- Run this script as a MySQL administrator, for example:
-- mysql -u root -p < database/setup-local.sql

CREATE DATABASE IF NOT EXISTS `smart_hazri`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'smart_hazri_app'@'localhost'
  IDENTIFIED BY 'SmartHazriLocal2026_ChangeMe';
CREATE USER IF NOT EXISTS 'smart_hazri_app'@'127.0.0.1'
  IDENTIFIED BY 'SmartHazriLocal2026_ChangeMe';

ALTER USER 'smart_hazri_app'@'localhost'
  IDENTIFIED BY 'SmartHazriLocal2026_ChangeMe';
ALTER USER 'smart_hazri_app'@'127.0.0.1'
  IDENTIFIED BY 'SmartHazriLocal2026_ChangeMe';

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX,
  DROP, REFERENCES, CREATE VIEW, SHOW VIEW
ON `smart_hazri`.* TO 'smart_hazri_app'@'localhost';

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX,
  DROP, REFERENCES, CREATE VIEW, SHOW VIEW
ON `smart_hazri`.* TO 'smart_hazri_app'@'127.0.0.1';

FLUSH PRIVILEGES;

SELECT SCHEMA_NAME AS database_name
FROM INFORMATION_SCHEMA.SCHEMATA
WHERE SCHEMA_NAME = 'smart_hazri';
