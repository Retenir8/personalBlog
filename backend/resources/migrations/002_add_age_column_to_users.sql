-- 迁移脚本：为 users 表添加 age 字段
-- 日期: 2025-10-26
-- 说明: 添加 age 字段用于存储用户年龄

BEGIN;

-- 添加 age 字段，允许 NULL
ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;

-- 添加注释
COMMENT ON COLUMN users.age IS '用户年龄';

COMMIT;

