BEGIN;

UPDATE users SET role = 'admin' WHERE username = '周明远';
UPDATE users SET role = 'teacher' WHERE username = '赵文博';
UPDATE users SET role = 'caregiver' WHERE username = '刘芳';

UPDATE users SET gender = '女', age = 68, hobbies = '书法、园艺', health_condition = '身体状况良好' WHERE username = '张桂英';
UPDATE users SET gender = '男', age = 72, hobbies = '太极、摄影', health_condition = '血压控制稳定' WHERE username = '李建国';
UPDATE users SET gender = '女', age = 65, hobbies = '合唱、舞蹈', health_condition = '身体状况良好' WHERE username = '陈秀兰';
UPDATE users SET gender = '男', age = 75, hobbies = '象棋、阅读', health_condition = '膝关节不宜剧烈运动' WHERE username = '王德明';
UPDATE users SET gender = '女', age = 70, hobbies = '烹饪、旅游', health_condition = '血糖控制稳定' WHERE username = '孙玉梅';

INSERT INTO courses (title, category, description, start_date, end_date, class_time, location, capacity, status, contact_phone)
SELECT seed.* FROM (VALUES
  ('春季太极养生班', '健康养生', '适合长者的太极基础动作与呼吸练习。', CURRENT_DATE + 7, CURRENT_DATE + 70, '每周一、周四 08:30', '一楼健身厅', 20, 0, '400-820-1001'),
  ('手机摄影入门', '科技数码', '学习构图、拍摄和照片整理。', CURRENT_DATE + 10, CURRENT_DATE + 60, '每周三 14:00', '三楼电脑室', 16, 0, '400-820-1002'),
  ('经典歌曲合唱', '音乐舞蹈', '练习呼吸、发声和经典歌曲合唱。', CURRENT_DATE + 5, CURRENT_DATE + 80, '每周六 09:30', '多功能活动厅', 30, 0, '400-820-1003'),
  ('楷书基础课堂', '艺术文化', '从基本笔画开始学习楷书临摹。', CURRENT_DATE + 12, CURRENT_DATE + 75, '每周二 09:00', '二楼书画室', 18, 0, '400-820-1004')
) AS seed(title, category, description, start_date, end_date, class_time, location, capacity, status, contact_phone)
WHERE NOT EXISTS (SELECT 1 FROM courses c WHERE c.title = seed.title AND c.is_deleted = FALSE);

INSERT INTO course_enrollments (user_id, course_id)
SELECT u.user_id, c.course_id
FROM (VALUES
  ('张桂英', '楷书基础课堂'), ('张桂英', '春季太极养生班'),
  ('李建国', '春季太极养生班'), ('李建国', '手机摄影入门'),
  ('陈秀兰', '经典歌曲合唱'), ('王德明', '手机摄影入门'),
  ('孙玉梅', '经典歌曲合唱')
) AS relation(username, title)
JOIN users u ON u.username = relation.username
JOIN courses c ON c.title = relation.title AND c.is_deleted = FALSE
ON CONFLICT (user_id, course_id) DO NOTHING;

INSERT INTO care_records (user_id, recorder_id, physical_status, mental_status, check_details, checked_at, advice)
SELECT elder.user_id, caregiver.user_id, seed.physical_status, seed.mental_status,
       seed.check_details, NOW() - seed.days_ago * INTERVAL '1 day', seed.advice
FROM (VALUES
  ('张桂英', '血压平稳，活动能力良好', '情绪愉快', '血压128/78mmHg，心率72次/分', 2, '保持每日散步和规律作息'),
  ('李建国', '轻微腰部不适', '状态稳定', '基础体征正常，久坐后腰部酸胀', 4, '避免久坐，进行舒缓拉伸'),
  ('陈秀兰', '身体状况良好', '乐于交流', '睡眠和食欲正常', 1, '继续参加社交和文娱活动'),
  ('王德明', '膝关节活动受限', '偶有焦虑', '上下楼后膝部疼痛，无明显肿胀', 3, '避免高冲击运动并定期复查')
) AS seed(username, physical_status, mental_status, check_details, days_ago, advice)
JOIN users elder ON elder.username = seed.username
JOIN users caregiver ON caregiver.username = '刘芳'
WHERE NOT EXISTS (SELECT 1 FROM care_records r WHERE r.user_id = elder.user_id AND r.check_details = seed.check_details);

INSERT INTO activities (title, summary, activity_date, location, contact_phone, publisher_id)
SELECT seed.title, seed.summary, seed.activity_date, seed.location, seed.contact_phone, publisher.user_id
FROM (VALUES
  ('健康知识讲座', '讲解秋季慢病管理、合理用药和日常饮食。', NOW() + INTERVAL '3 days', '多功能活动厅', '400-820-2001'),
  ('长者趣味运动会', '设置套圈、柔力球和健步走等低强度项目。', NOW() + INTERVAL '8 days', '社区中心广场', '400-820-2002'),
  ('智能手机答疑日', '现场解答挂号、支付、拍照和视频通话问题。', NOW() + INTERVAL '14 days', '三楼电脑室', '400-820-2003')
) AS seed(title, summary, activity_date, location, contact_phone)
JOIN users publisher ON publisher.username = '刘芳'
WHERE NOT EXISTS (SELECT 1 FROM activities a WHERE a.title = seed.title AND a.is_published = TRUE);

COMMIT;
