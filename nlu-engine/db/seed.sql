-- Truncate existing data to start clean
TRUNCATE TABLE scholarships_policies CASCADE;
TRUNCATE TABLE certificate_conversion CASCADE;
TRUNCATE TABLE admission_quotas CASCADE;
TRUNCATE TABLE admission_scores CASCADE;
TRUNCATE TABLE admission_methods CASCADE;
TRUNCATE TABLE major_descriptions CASCADE;
TRUNCATE TABLE majors CASCADE;

-- Insert Majors (20 majors from 2026 plan)
INSERT INTO majors (code, name, program_type, tuition_fee, curriculum_summary)
VALUES
  ('CN1', 'Công nghệ thông tin', 'Standard', 44.00, '145 tín chỉ, đào tạo 4 năm. Chuyên ngành: Kỹ thuật phần mềm, Hệ thống thông tin, Mạng máy tính.'),
  ('CN2', 'Kỹ thuật máy tính', 'Standard', 40.00, '145 tín chỉ, đào tạo 4 năm. Chuyên ngành: Thiết kế vi mạch, Hệ thống nhúng.'),
  ('CN3', 'Vật lý kỹ thuật', 'Standard', 35.00, '140 tín chỉ, đào tạo 4 năm. Chuyên ngành: Vật lý ứng dụng, Quang tử.'),
  ('CN4', 'Cơ kỹ thuật', 'Standard', 35.00, '140 tín chỉ, đào tạo 4 năm. Chuyên ngành: Cơ khí chính xác, Mô phỏng.'),
  ('CN5', 'Công nghệ kỹ thuật xây dựng', 'Standard', 35.00, '140 tín chỉ, đào tạo 4 năm. Chuyên ngành: Hạ tầng giao thông, Xây dựng dân dụng.'),
  ('CN6', 'Công nghệ kỹ thuật cơ - điện tử', 'Standard', 38.00, '142 tín chỉ, đào tạo 4 năm. Chuyên ngành: Hệ thống cơ điện tử, Tự động hóa.'),
  ('CN7', 'Công nghệ hàng không vũ trụ', 'Standard', 40.00, '145 tín chỉ, đào tạo 4 năm. Chuyên ngành: Kỹ thuật hàng không, Vệ tinh.'),
  ('CN8', 'Khoa học máy tính', 'Standard', 44.00, '150 tín chỉ, đào tạo 4.5 năm. Chuyên ngành: Trí tuệ nhân tạo, Thuật toán và phần mềm.'),
  ('CN9', 'Công nghệ kỹ thuật điện tử - viễn thông', 'Standard', 40.00, '145 tín chỉ, đào tạo 4 năm. Chuyên ngành: Viễn thông, Hệ thống nhúng.'),
  ('CN10', 'Công nghệ nông nghiệp', 'Standard', 35.00, '140 tín chỉ, đào tạo 4 năm. Chuyên ngành: Nông nghiệp công nghệ cao.'),
  ('CN11', 'Kỹ thuật điều khiển và tự động hóa', 'Standard', 40.00, '145 tín chỉ, đào tạo 4 năm. Chuyên ngành: Robot, Hệ thống điều khiển.'),
  ('CN12', 'Trí tuệ nhân tạo', 'Standard', 44.00, '145 tín chỉ, đào tạo 4 năm. Chuyên ngành: Học máy, NLP, Thị giác máy tính.'),
  ('CN13', 'Kỹ thuật năng lượng', 'Standard', 35.00, '140 tín chỉ, đào tạo 4 năm. Chuyên ngành: Năng lượng tái tạo.'),
  ('CN14', 'Hệ thống thông tin', 'Standard', 44.00, '142 tín chỉ, đào tạo 4 năm. Chuyên ngành: Quản trị dữ liệu, Phân tích nghiệp vụ.'),
  ('CN15', 'Mạng máy tính và truyền thông dữ liệu', 'Standard', 40.00, '142 tín chỉ, đào tạo 4 năm. Chuyên ngành: Cloud computing, Quản trị mạng.'),
  ('CN17', 'Kỹ thuật Robot', 'Standard', 40.00, '145 tín chỉ, đào tạo 4 năm. Chuyên ngành: Thiết kế chế tạo robot, Robot thông minh.'),
  ('CN18', 'Thiết kế công nghiệp và Đồ họa', 'Standard', 38.00, '140 tín chỉ, đào tạo 4 năm. Chuyên ngành: Mỹ thuật công nghiệp, UI/UX.'),
  ('CN19', 'Công nghệ vật liệu', 'Standard', 38.00, '140 tín chỉ, đào tạo 4 năm. Chuyên ngành: Vật liệu bán dẫn, Vi điện tử.'),
  ('CN20', 'Khoa học dữ liệu', 'Standard', 44.00, '145 tín chỉ, đào tạo 4 năm. Chuyên ngành: Kỹ thuật dữ liệu, Phân tích dữ liệu lớn.'),
  ('CN21', 'Công nghệ sinh học', 'Standard', 35.00, '140 tín chỉ, đào tạo 4 năm. Chuyên ngành: Công nghệ kỹ thuật sinh học.')
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  program_type = EXCLUDED.program_type,
  tuition_fee = EXCLUDED.tuition_fee,
  curriculum_summary = EXCLUDED.curriculum_summary;

-- Insert Major Descriptions
INSERT INTO major_descriptions (major_id, introduction, duration, orientation)
VALUES
  ((SELECT id FROM majors WHERE code = 'CN1'), 'Ngành học mũi nhọn đào tạo chuyên sâu về phát triển phần mềm, mạng máy tính, an toàn thông tin và hệ thống thông tin.', 4.0, 'Lập trình viên, Kỹ sư phần mềm, Kiến trúc sư hệ thống, Chuyên gia kiểm thử.'),
  ((SELECT id FROM majors WHERE code = 'CN2'), 'Kỹ thuật máy tính tập trung nghiên cứu thiết kế vi mạch, hệ thống nhúng thông minh và tích hợp phần cứng - phần mềm.', 4.0, 'Kỹ sư vi mạch, Thiết kế phần cứng, Kỹ sư lập trình hệ thống nhúng.'),
  ((SELECT id FROM majors WHERE code = 'CN3'), 'Vật lý kỹ thuật kết hợp giữa khoa học nền tảng và ứng dụng thực tiễn trong công nghệ quang tử và vật liệu mới.', 4.0, 'Nghiên cứu viên, Kỹ sư quang điện tử, Chuyên viên phát triển sản phẩm.'),
  ((SELECT id FROM majors WHERE code = 'CN4'), 'Cơ kỹ thuật đào tạo chuyên sâu về cơ học vật lý, kỹ thuật cơ khí chính xác và mô phỏng số.', 4.0, 'Kỹ sư thiết kế cơ khí, Chuyên viên tính toán kết cấu, Chuyên gia mô phỏng.'),
  ((SELECT id FROM majors WHERE code = 'CN5'), 'Công nghệ kỹ thuật xây dựng đào tạo kiến thức thiết kế công trình, quản lý dự án và hạ tầng giao thông thông minh.', 4.0, 'Kỹ sư xây dựng, Giám sát công trình, Quản lý dự án xây dựng.'),
  ((SELECT id FROM majors WHERE code = 'CN6'), 'Cơ điện tử tích hợp cơ học chính xác, điện tử viễn thông và điều khiển thông minh để thiết kế hệ thống sản xuất tự động.', 4.0, 'Kỹ sư cơ điện tử, Kỹ sư tự động hóa, Thiết kế hệ thống thông minh.'),
  ((SELECT id FROM majors WHERE code = 'CN7'), 'Công nghệ hàng không vũ trụ tập trung phát triển kỹ thuật hàng không, công nghệ vệ tinh và thiết bị bay không người lái.', 4.0, 'Kỹ sư hàng không, Chuyên gia vận hành vệ tinh, Thiết kế UAV.'),
  ((SELECT id FROM majors WHERE code = 'CN8'), 'Khoa học máy tính chuyên sâu về nghiên cứu giải thuật, trí tuệ nhân tạo, khoa học dữ liệu và học máy nâng cao.', 4.5, 'Kỹ sư AI, Nhà khoa học dữ liệu, Nhà nghiên cứu thuật toán.'),
  ((SELECT id FROM majors WHERE code = 'CN9'), 'Điện tử viễn thông nghiên cứu kỹ thuật truyền thông, IoT, viễn thông di động 5G/6G và xử lý tín hiệu.', 4.0, 'Kỹ sư viễn thông, Thiết kế mạng IoT, Chuyên gia truyền thông.'),
  ((SELECT id FROM majors WHERE code = 'CN10'), 'Công nghệ nông nghiệp ứng dụng IoT, AI, cảm biến thông minh vào quản lý cây trồng và sản xuất nông nghiệp thông minh.', 4.0, 'Kỹ sư nông nghiệp công nghệ cao, Chuyên gia giải pháp nông nghiệp thông minh.'),
  ((SELECT id FROM majors WHERE code = 'CN11'), 'Kỹ thuật điều khiển và tự động hóa nghiên cứu hệ thống điều khiển tự động, dây chuyền sản xuất và thiết bị robot.', 4.0, 'Kỹ sư tự động hóa, Thiết kế dây chuyền sản xuất, Kỹ sư hệ thống scada.'),
  ((SELECT id FROM majors WHERE code = 'CN12'), 'Trí tuệ nhân tạo chuyên sâu về các mô hình học sâu, xử lý ngôn ngữ tự nhiên, thị giác máy tính và ứng dụng AI thực tế.', 4.0, 'Kỹ sư AI, Chuyên gia xử lý ngôn ngữ tự nhiên, Kỹ sư thị giác máy.'),
  ((SELECT id FROM majors WHERE code = 'CN13'), 'Kỹ thuật năng lượng đào tạo về hệ thống điện, năng lượng tái tạo (mặt trời, gió) và hiệu quả sử dụng năng lượng.', 4.0, 'Kỹ sư năng lượng, Chuyên gia năng lượng xanh, Thiết kế hệ thống điện.'),
  ((SELECT id FROM majors WHERE code = 'CN14'), 'Hệ thống thông tin nghiên cứu quản lý, phân tích dữ liệu lớn và giải pháp CNTT hỗ trợ vận hành doanh nghiệp.', 4.0, 'Chuyên viên phân tích nghiệp vụ (BA), Quản trị cơ sở dữ liệu, Kỹ sư hệ thống thông tin.'),
  ((SELECT id FROM majors WHERE code = 'CN15'), 'Mạng máy tính và truyền thông dữ liệu chuyên sâu về thiết kế hạ tầng mạng, điện toán đám mây và an ninh mạng.', 4.0, 'Kỹ sư hệ thống cloud, Quản trị mạng doanh nghiệp, Chuyên gia an ninh mạng.'),
  ((SELECT id FROM majors WHERE code = 'CN17'), 'Kỹ thuật Robot tập trung thiết kế, lắp ráp và lập trình cho các robot công nghiệp và robot hỗ trợ dịch vụ.', 4.0, 'Kỹ sư thiết kế robot, Chuyên gia robot công nghiệp, Kỹ sư điều khiển robot.'),
  ((SELECT id FROM majors WHERE code = 'CN18'), 'Thiết kế công nghiệp và Đồ họa đào tạo tích hợp mỹ thuật và công nghệ, thiết kế giao diện ứng dụng UI/UX và thiết kế công nghiệp.', 4.0, 'Thiết kế UI/UX, Thiết kế đồ họa, Thiết kế sản phẩm công nghiệp.'),
  ((SELECT id FROM majors WHERE code = 'CN19'), 'Công nghệ vật liệu chuyên sâu về thiết kế và chế tạo linh kiện bán dẫn, vi mạch điện tử và vật liệu nano tiên tiến.', 4.0, 'Kỹ sư bán dẫn, Thiết kế vi mạch, Kỹ sư vật liệu điện tử.'),
  ((SELECT id FROM majors WHERE code = 'CN20'), 'Khoa học dữ liệu tập trung xây dựng mô hình thu thập, xử lý và phân tích dữ liệu lớn phục vụ ra quyết định chiến lược.', 4.0, 'Kỹ sư dữ liệu (Data Engineer), Nhà phân tích dữ liệu (Data Analyst).'),
  ((SELECT id FROM majors WHERE code = 'CN21'), 'Công nghệ sinh học ứng dụng công nghệ gene, sinh học nano và kỹ thuật sinh học trong y học và nông nghiệp.', 4.0, 'Kỹ sư sinh học, Nghiên cứu viên y sinh, Chuyên viên kiểm định.')
ON CONFLICT (major_id) DO UPDATE
SET
  introduction = EXCLUDED.introduction,
  duration = EXCLUDED.duration,
  orientation = EXCLUDED.orientation;

-- Insert Admission Methods
INSERT INTO admission_methods (method_name, description)
VALUES
  ('THPTQG', 'Xét điểm thi tốt nghiệp THPT'),
  ('HSA', 'Xét kết quả thi Đánh giá năng lực của ĐHQGHN'),
  ('SAT', 'Xét kết quả chứng chỉ quốc tế SAT'),
  ('Combined', 'Xét tuyển kết hợp chứng chỉ ngoại ngữ và học bạ')
ON CONFLICT (method_name) DO UPDATE
SET description = EXCLUDED.description;

-- Insert Historic/Current Admission Scores (Benchmarks for 2024 and 2025)
INSERT INTO admission_scores (major_id, method_id, year, score, subject_groups)
VALUES
  -- CN1
  ((SELECT id FROM majors WHERE code = 'CN1'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2024, 27.80, 'A00, A01, X06'),
  ((SELECT id FROM majors WHERE code = 'CN1'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2025, 28.19, 'A00, A01, X06'),
  ((SELECT id FROM majors WHERE code = 'CN1'), (SELECT id FROM admission_methods WHERE method_name = 'Combined'), 2026, 25.50, 'IELTS + GPA'),
  -- CN8
  ((SELECT id FROM majors WHERE code = 'CN8'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2024, 27.58, 'A00, A01, X06'),
  ((SELECT id FROM majors WHERE code = 'CN8'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2025, 27.86, 'A00, A01, X06'),
  ((SELECT id FROM majors WHERE code = 'CN8'), (SELECT id FROM admission_methods WHERE method_name = 'Combined'), 2026, 26.50, 'IELTS + GPA'),
  -- CN12
  ((SELECT id FROM majors WHERE code = 'CN12'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2024, 27.12, 'A00, A01, X06'),
  ((SELECT id FROM majors WHERE code = 'CN12'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2025, 27.75, 'A00, A01, X06'),
  -- CN11
  ((SELECT id FROM majors WHERE code = 'CN11'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2024, 27.05, 'A00, A01, X06'),
  ((SELECT id FROM majors WHERE code = 'CN11'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2025, 27.90, 'A00, A01, X06'),
  -- CN20
  ((SELECT id FROM majors WHERE code = 'CN20'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2025, 27.38, 'A00, A01, X06'),
  -- CN14
  ((SELECT id FROM majors WHERE code = 'CN14'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2024, 26.87, 'A00, A01, X06'),
  ((SELECT id FROM majors WHERE code = 'CN14'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2025, 26.38, 'A00, A01, X06'),
  -- CN2
  ((SELECT id FROM majors WHERE code = 'CN2'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2024, 26.97, 'A00, A01, X06'),
  ((SELECT id FROM majors WHERE code = 'CN2'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2025, 27.00, 'A00, A01, X06'),
  -- CN10
  ((SELECT id FROM majors WHERE code = 'CN10'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2024, 22.50, 'A00, A01, A02, X06'),
  ((SELECT id FROM majors WHERE code = 'CN10'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2025, 22.00, 'A00, A01, A02, X06'),
  -- CN5
  ((SELECT id FROM majors WHERE code = 'CN5'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2024, 23.91, 'A00, A01, X06'),
  ((SELECT id FROM majors WHERE code = 'CN5'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2025, 22.25, 'A00, A01, X06')
ON CONFLICT DO NOTHING;

-- Insert 2026 Quotas (Admissions Quotas from the 2026 plan)
INSERT INTO admission_quotas (major_id, method_id, year, quota, is_expected)
VALUES
  ((SELECT id FROM majors WHERE code = 'CN1'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2026, 460, FALSE),
  ((SELECT id FROM majors WHERE code = 'CN2'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2026, 400, FALSE),
  ((SELECT id FROM majors WHERE code = 'CN3'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2026, 160, FALSE),
  ((SELECT id FROM majors WHERE code = 'CN4'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2026, 60, FALSE),
  ((SELECT id FROM majors WHERE code = 'CN5'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2026, 160, FALSE),
  ((SELECT id FROM majors WHERE code = 'CN6'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2026, 160, FALSE),
  ((SELECT id FROM majors WHERE code = 'CN7'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2026, 120, FALSE),
  ((SELECT id FROM majors WHERE code = 'CN8'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2026, 400, FALSE),
  ((SELECT id FROM majors WHERE code = 'CN9'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2026, 480, FALSE),
  ((SELECT id FROM majors WHERE code = 'CN10'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2026, 60, FALSE),
  ((SELECT id FROM majors WHERE code = 'CN11'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2026, 140, FALSE),
  ((SELECT id FROM majors WHERE code = 'CN12'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2026, 320, FALSE),
  ((SELECT id FROM majors WHERE code = 'CN13'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2026, 60, FALSE),
  ((SELECT id FROM majors WHERE code = 'CN14'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2026, 240, FALSE),
  ((SELECT id FROM majors WHERE code = 'CN15'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2026, 120, FALSE),
  ((SELECT id FROM majors WHERE code = 'CN17'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2026, 140, FALSE),
  ((SELECT id FROM majors WHERE code = 'CN18'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2026, 240, FALSE),
  ((SELECT id FROM majors WHERE code = 'CN19'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2026, 120, FALSE),
  ((SELECT id FROM majors WHERE code = 'CN20'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2026, 120, FALSE),
  ((SELECT id FROM majors WHERE code = 'CN21'), (SELECT id FROM admission_methods WHERE method_name = 'THPTQG'), 2026, 60, FALSE)
ON CONFLICT DO NOTHING;

-- Insert IELTS Score Conversion
INSERT INTO certificate_conversion (cert_type, original_score, converted_score)
VALUES
  ('IELTS', 5.5, 8.00),
  ('IELTS', 6.0, 8.50),
  ('IELTS', 6.5, 9.00),
  ('IELTS', 7.0, 9.50),
  ('IELTS', 7.5, 10.00),
  ('IELTS', 8.0, 10.00),
  ('IELTS', 8.5, 10.00),
  ('IELTS', 9.0, 10.00)
ON CONFLICT (cert_type, original_score) DO UPDATE
SET converted_score = EXCLUDED.converted_score;

-- Insert Scholarships & Policies
INSERT INTO scholarships_policies (category, name, description, major_id)
VALUES
  ('Scholarship', 'Học bổng Samsung (V-STT)', 'Học bổng đặc biệt từ đối tác Samsung dành cho sinh viên xuất sắc khối ngành Công nghệ thông tin và Điện tử viễn thông.', NULL),
  ('Scholarship', 'Học bổng Toshiba', 'Học bổng nghiên cứu và hỗ trợ học tập hàng năm từ tập đoàn Toshiba.', NULL),
  ('Scholarship', 'Học bổng Thạc sĩ Pony Chung', 'Chương trình học bổng Thạc sĩ tại Đại học Korea do Quỹ Pony Chung tài trợ cho sinh viên năm cuối xuất sắc.', NULL)
ON CONFLICT DO NOTHING;
