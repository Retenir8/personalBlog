-- =====================================================
-- 文件上传记录表
-- 用于追踪所有上传的文件，便于管理、审计和清理
-- =====================================================

CREATE TABLE IF NOT EXISTS file_uploads
(
    -- 主键：文件唯一ID
    file_id           BIGSERIAL PRIMARY KEY,

    -- 原始文件名（用户上传时的文件名）
    original_filename VARCHAR(255) NOT NULL,

    -- 存储文件名（系统生成的唯一文件名，如 UUID）
    stored_filename   VARCHAR(255) NOT NULL,

    -- 文件完整路径（相对路径，如 /uploads/2024/10/24/xxx.jpg）
    file_path         VARCHAR(500) NOT NULL UNIQUE,

    -- 文件大小（字节）
    file_size         BIGINT       NOT NULL,

    -- 文件 MIME 类型（如 image/jpeg）
    content_type      VARCHAR(100),

    -- 上传时间
    upload_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 上传者用户ID（外键关联 users 表）
    uploader_id       BIGINT,

    -- 文件类型标识（用于分类管理）
    -- 可选值：'avatar'（头像）, 'course_image'（课程封面）, 'other'（其他）
    file_type         VARCHAR(50),

    -- 逻辑删除标记（0=正常，1=已删除）
    is_deleted        SMALLINT  DEFAULT 0,

    -- 创建时间
    create_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 最后更新时间
    update_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 外键约束（可选，如果需要严格关联）
    CONSTRAINT fk_uploader FOREIGN KEY (uploader_id)
        REFERENCES users (user_id) ON DELETE SET NULL
);

-- =====================================================
-- 索引优化
-- =====================================================

-- 为上传者ID创建索引（便于查询某用户上传的所有文件）
CREATE INDEX IF NOT EXISTS idx_file_uploads_uploader_id ON file_uploads (uploader_id);

-- 为文件类型创建索引（便于按类型查询）
CREATE INDEX IF NOT EXISTS idx_file_uploads_file_type ON file_uploads (file_type);

-- 为上传时间创建索引（便于按时间范围查询）
CREATE INDEX IF NOT EXISTS idx_file_uploads_upload_time ON file_uploads (upload_time);

-- 为逻辑删除标记创建索引（便于过滤已删除文件）
CREATE INDEX IF NOT EXISTS idx_file_uploads_is_deleted ON file_uploads (is_deleted);

-- 为文件路径创建唯一索引（确保路径唯一性）
CREATE UNIQUE INDEX IF NOT EXISTS idx_file_uploads_file_path ON file_uploads (file_path) WHERE is_deleted = 0;

-- =====================================================
-- 注释说明
-- =====================================================

COMMENT ON TABLE file_uploads IS '文件上传记录表，用于追踪和管理所有上传的文件';
COMMENT ON COLUMN file_uploads.file_id IS '文件唯一标识ID';
COMMENT ON COLUMN file_uploads.original_filename IS '用户上传时的原始文件名';
COMMENT ON COLUMN file_uploads.stored_filename IS '系统存储的文件名（UUID等）';
COMMENT ON COLUMN file_uploads.file_path IS '文件相对路径，如 /uploads/2024/10/24/xxx.jpg';
COMMENT ON COLUMN file_uploads.file_size IS '文件大小（字节）';
COMMENT ON COLUMN file_uploads.content_type IS '文件MIME类型，如 image/jpeg';
COMMENT ON COLUMN file_uploads.upload_time IS '文件上传时间';
COMMENT ON COLUMN file_uploads.uploader_id IS '上传者用户ID';
COMMENT ON COLUMN file_uploads.file_type IS '文件类型标识：avatar/course_image/other';
COMMENT ON COLUMN file_uploads.is_deleted IS '逻辑删除标记：0=正常，1=已删除';

-- =====================================================
-- 示例数据（可选）
-- =====================================================

-- INSERT INTO file_uploads (
--     original_filename, 
--     stored_filename, 
--     file_path, 
--     file_size, 
--     content_type, 
--     uploader_id, 
--     file_type
-- ) VALUES (
--     'avatar.jpg',
--     'a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg',
--     '/uploads/2024/10/24/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg',
--     102400,
--     'image/jpeg',
--     1,
--     'avatar'
-- );

