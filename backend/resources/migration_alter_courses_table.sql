-- Migration: 修改 courses 表，将部分字段改为可选
-- 日期: 2025-10-25
-- 说明: 根据前端需求，只有 title, capacity, class_time, location 是必传字段
--       其他字段 (category, description, start_date) 改为可选

-- 修改 category 字段，允许 NULL
ALTER TABLE courses ALTER COLUMN category DROP NOT NULL;

-- 修改 start_date 字段，允许 NULL
ALTER TABLE courses ALTER COLUMN start_date DROP NOT NULL;

-- description 字段原本就是可选的，无需修改
-- end_date 字段原本就是可选的，无需修改

-- 验证修改后的表结构
-- 可以使用以下命令查看表结构：
-- \d courses

