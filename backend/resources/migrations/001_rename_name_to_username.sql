-- 迁移脚本：将 users 表的 name 字段重命名为 username

BEGIN;

-- 重命名字段
ALTER TABLE users RENAME COLUMN name TO username;

COMMIT;

