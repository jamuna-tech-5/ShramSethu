-- Seed Data for ShramSethu

-- Skills
INSERT INTO skills (name, category) VALUES
('Driving', 'Transport'),
('Delivery', 'Transport'),
('Cooking', 'Food & Hospitality'),
('Cleaning', 'Household'),
('Plumbing', 'Home Services'),
('Electrician', 'Home Services'),
('Carpentry', 'Home Services'),
('Painting', 'Home Services'),
('Gardening', 'Household'),
('Security Guard', 'Security'),
('Data Entry', 'IT & Digital'),
('Web Development', 'IT & Digital'),
('Graphic Design', 'IT & Digital'),
('Customer Support', 'IT & Digital'),
('Photography', 'Creative'),
('Tailoring', 'Fashion'),
('Beauty & Wellness', 'Beauty'),
('Teaching & Tutoring', 'Education'),
('Healthcare Assistant', 'Healthcare'),
('Logistics & Warehousing', 'Logistics');

-- Government Schemes
INSERT INTO government_schemes (name, description, ministry, benefits, application_url, category, eligibility_criteria) VALUES
('PM-SYM (Pradhan Mantri Shram Yogi Maan-Dhan)', 'Pension scheme for unorganized workers', 'Ministry of Labour', 'Monthly pension of ₹3000 after age 60', 'https://maandhan.in/', 'Pension', '{"min_age": 18, "max_age": 40, "monthly_income_max": 15000}'),
('PMSBY (Pradhan Mantri Suraksha Bima Yojana)', 'Accidental death and disability insurance', 'Ministry of Finance', '₹2 lakh accidental death cover for just ₹20/year', 'https://jansuraksha.gov.in/', 'Insurance', '{"min_age": 18, "max_age": 70, "bank_account": true}'),
('PMJJBY (Pradhan Mantri Jeevan Jyoti Bima Yojana)', 'Life insurance scheme', 'Ministry of Finance', '₹2 lakh life cover for ₹436/year', 'https://jansuraksha.gov.in/', 'Insurance', '{"min_age": 18, "max_age": 50, "bank_account": true}'),
('e-Shram Card', 'National database and identity for unorganized workers', 'Ministry of Labour', 'Identity card, ₹2 lakh accident insurance, welfare benefits', 'https://eshram.gov.in/', 'Identity', '{"not_income_tax_payer": true, "not_epf_member": true}'),
('PMKVY (Pradhan Mantri Kaushal Vikas Yojana)', 'Skill training and certification', 'Ministry of Skill Development', 'Free skill training and recognized certification', 'https://pmkvyofficial.org/', 'Skill Development', '{"min_age": 15, "unemployed": true}'),
('Mudra Loan - Shishu', 'Micro loans for small businesses', 'Ministry of Finance', 'Loans up to ₹50,000 for micro enterprises', 'https://mudra.org.in/', 'Finance', '{"business_type": "micro", "max_loan": 50000}');

-- Admin User (password: Admin@123)
INSERT INTO users (email, phone, password_hash, role, full_name, is_verified) VALUES
('admin@shramsethu.in', '9999999999', '$2b$10$rOzJqEQ.Xh4RQPUlbLHKs.5B6EXtAYH.y2cRqQQYJxmz3eWJdDiXG', 'ADMIN', 'ShramSethu Admin', true);