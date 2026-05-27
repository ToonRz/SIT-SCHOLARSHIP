CREATE DATABASE IF NOT EXISTS sit_scholarship;
USE sit_scholarship;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20) UNIQUE NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NULL,
  faculty VARCHAR(100) DEFAULT 'School of Information Technology',
  department VARCHAR(100) NULL,
  year_of_study INT NULL,
  gpa DECIMAL(3,2) NULL,
  role ENUM('student', 'admin', 'committee') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Scholarships table
CREATE TABLE IF NOT EXISTS scholarships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  eligibility TEXT NULL,
  benefits TEXT NULL,
  required_documents TEXT NULL,
  application_start DATE NULL,
  application_end DATE NULL,
  status ENUM('open', 'closed', 'upcoming') DEFAULT 'upcoming',
  max_recipients INT DEFAULT 0,
  scholarship_type ENUM('sit-merit', 'sit-activity', 'sit-work', 'kmutt-grant', 'kmutt-loan', 'kmutt-special', 'international') DEFAULT 'sit-merit',
  category ENUM('sit', 'kmutt', 'international') DEFAULT 'sit',
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  scholarship_id INT NOT NULL,
  statement TEXT NULL,
  family_income DECIMAL(12,2) NULL,
  additional_info TEXT NULL,
  document_url VARCHAR(500) NULL,
  status ENUM('pending', 'reviewing', 'approved', 'rejected') DEFAULT 'pending',
  admin_comment TEXT NULL,
  reviewed_by INT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  UNIQUE(user_id, scholarship_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);
