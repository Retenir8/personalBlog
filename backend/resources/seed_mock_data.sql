BEGIN;

UPDATE users SET
  gender = CASE username
    WHEN 'demo_zhang' THEN '女' WHEN 'demo_li' THEN '男'
    WHEN 'demo_wang' THEN '女' WHEN 'demo_zhao' THEN '男'
    WHEN 'demo_chen' THEN '女' WHEN 'demo_liu' THEN '男'
  END,
  age = CASE username
    WHEN 'demo_zhang' THEN 66 WHEN 'demo_li' THEN 71
    WHEN 'demo_wang' THEN 63 WHEN 'demo_zhao' THEN 75
    WHEN 'demo_chen' THEN 68 WHEN 'demo_liu' THEN 70
  END,
  phone = CASE username
    WHEN 'demo_zhang' THEN '13800001001' WHEN 'demo_li' THEN '13800001002'
    WHEN 'demo_wang' THEN '13800001003' WHEN 'demo_zhao' THEN '13800001004'
    WHEN 'demo_chen' THEN '13800001005' WHEN 'demo_liu' THEN '13800001006'
  END,
  hobbies = CASE username
    WHEN 'demo_zhang' THEN '书法、国画' WHEN 'demo_li' THEN '太极、摄影'
    WHEN 'demo_wang' THEN '舞蹈、音乐' WHEN 'demo_zhao' THEN '智能手机、象棋'
    WHEN 'demo_chen' THEN '园艺、烹饪' WHEN 'demo_liu' THEN '英语、旅游'
  END,
  health_condition = CASE username
    WHEN 'demo_zhao' THEN '膝关节不宜剧烈运动' ELSE '身体状况良好'
  END
WHERE username LIKE 'demo_%';

UPDATE users SET role = 'teacher' WHERE username = 'demo_teacher';
UPDATE users SET role = 'caregiver' WHERE username = 'demo_caregiver';

INSERT INTO courses (title, category, description, start_date, end_date, class_time, location, capacity, status, contact_phone)
SELECT * FROM (VALUES
  ('零基础书法入门', '艺术文化', '学习握笔、基本笔画和楷书临摹。', DATE '2026-09-15', DATE '2026-12-15', '每周二 09:00-10:30', '文化活动室 A', 20, 1, '021-60001001'),
  ('八段锦养生班', '健康养生', '循序渐进学习八段锦，改善柔韧性与平衡。', DATE '2026-09-18', DATE '2026-11-20', '每周五 08:30-09:30', '健身厅', 18, 1, '021-60001002'),
  ('智能手机轻松学', '科技数码', '学习微信、拍照、挂号和移动支付基础操作。', DATE '2026-10-10', DATE '2026-12-12', '每周六 14:00-15:30', '电脑教室', 15, 0, '021-60001003'),
  ('经典老歌合唱团', '音乐舞蹈', '练习呼吸、发声与经典歌曲合唱。', DATE '2026-09-12', DATE '2027-01-16', '每周六 09:30-11:00', '多功能厅', 30, 1, '021-60001004'),
  ('家庭园艺小课堂', '手工制作', '学习阳台花卉养护、换盆和病虫害预防。', DATE '2026-10-08', DATE '2026-11-26', '每周四 14:00-15:30', '园艺教室', 16, 0, '021-60001005'),
  ('长者英语会话', '语言学习', '围绕问路、购物和旅游场景练习简单英语。', DATE '2026-09-14', DATE '2026-12-21', '每周一 15:00-16:30', '语言教室', 20, 1, '021-60001006'),
  ('国画山水基础', '艺术文化', '从用墨、构图开始完成小幅山水作品。', DATE '2026-05-05', DATE '2026-08-25', '每周二 14:00-16:00', '美术教室', 12, 2, '021-60001007'),
  ('银龄摄影实践', '科技数码', '掌握手机构图、用光和照片整理。', DATE '2026-09-20', DATE '2026-12-06', '每周日 09:00-11:00', '摄影教室', 14, 1, '021-60001008'),
  ('柔力球健身', '运动健身', '低冲击柔力球基础动作和简单套路。', DATE '2026-10-09', DATE '2026-12-18', '每周五 15:00-16:00', '室内球馆', 24, 0, '021-60001009'),
  ('营养早餐制作', '健康养生', '制作少油少盐、营养均衡的家庭早餐。', DATE '2026-09-16', DATE '2026-10-28', '每周三 09:30-11:00', '烹饪教室', 10, 1, '021-60001010')
) AS seed(title, category, description, start_date, end_date, class_time, location, capacity, status, contact_phone)
WHERE NOT EXISTS (SELECT 1 FROM courses c WHERE c.title = seed.title AND c.is_deleted = FALSE);

INSERT INTO course_enrollments (user_id, course_id)
SELECT u.user_id, c.course_id
FROM (VALUES
  ('demo_zhang', '零基础书法入门'), ('demo_zhang', '八段锦养生班'),
  ('demo_li', '八段锦养生班'), ('demo_li', '银龄摄影实践'),
  ('demo_wang', '经典老歌合唱团'), ('demo_wang', '零基础书法入门'),
  ('demo_zhao', '智能手机轻松学'), ('demo_zhao', '长者英语会话'),
  ('demo_chen', '家庭园艺小课堂'), ('demo_chen', '营养早餐制作'),
  ('demo_liu', '长者英语会话'), ('demo_liu', '银龄摄影实践')
) AS relation(username, title)
JOIN users u ON u.username = relation.username
JOIN courses c ON c.title = relation.title AND c.is_deleted = FALSE
ON CONFLICT (user_id, course_id) DO NOTHING;

INSERT INTO care_records (user_id, recorder_id, physical_status, mental_status, check_details, checked_at, advice)
SELECT elder.user_id, caregiver.user_id, seed.physical_status, seed.mental_status,
       seed.check_details, NOW() - seed.days_ago * INTERVAL '1 day', seed.advice
FROM (VALUES
  ('demo_zhang', '血压平稳，活动能力良好', '情绪愉快', '血压 128/78mmHg，心率 72 次/分', 2, '保持每日散步，按时作息'),
  ('demo_li', '轻微膝部不适', '状态稳定', '基础体征正常，膝关节活动后略感酸胀', 4, '避免高强度运动，可参加低冲击课程'),
  ('demo_wang', '身体状况良好', '乐于交流', '睡眠和食欲正常', 1, '继续保持社交与文娱活动'),
  ('demo_zhao', '血糖控制稳定', '偶有焦虑', '空腹血糖 6.3mmol/L', 5, '注意饮食，增加陪伴沟通')
) AS seed(username, physical_status, mental_status, check_details, days_ago, advice)
JOIN users elder ON elder.username = seed.username
JOIN users caregiver ON caregiver.username = 'demo_caregiver'
WHERE NOT EXISTS (
  SELECT 1 FROM care_records r
  WHERE r.user_id = elder.user_id AND r.check_details = seed.check_details
);

INSERT INTO activities (title, summary, activity_date, location, contact_phone, publisher_id)
SELECT seed.title, seed.summary, seed.activity_date, seed.location, seed.contact_phone, publisher.user_id
FROM (VALUES
  ('中秋诗词茶话会', '一起品茶、赏诗、分享节日故事，欢迎家属陪同参加。', NOW() + INTERVAL '3 days', '多功能活动厅', '13800002001'),
  ('秋季健康义诊', '提供血压、血糖检测和老年常见病健康咨询。', NOW() + INTERVAL '7 days', '一楼健康服务站', '13800002002'),
  ('银龄趣味运动会', '设置柔力球、套圈和健步走等适合长者的趣味项目。', NOW() + INTERVAL '14 days', '社区中心广场', '13800002003'),
  ('智能手机答疑日', '护理员与志愿者现场解答挂号、支付和视频通话问题。', NOW() + INTERVAL '21 days', '电脑教室', '13800002004')
) AS seed(title, summary, activity_date, location, contact_phone)
JOIN users publisher ON publisher.username = 'demo_caregiver'
WHERE NOT EXISTS (SELECT 1 FROM activities a WHERE a.title = seed.title AND a.is_published = TRUE);

COMMIT;
