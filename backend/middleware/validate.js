const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerValidation = [
  body('email').isEmail().withMessage('รูปแบบอีเมลไม่ถูกต้อง'),
  body('password').isLength({ min: 6 }).withMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'),
  body('student_id').notEmpty().withMessage('กรุณากรอกรหัสนักศึกษา'),
  body('first_name').notEmpty().withMessage('กรุณากรอกชื่อจริง'),
  body('last_name').notEmpty().withMessage('กรุณากรอกนามสกุล'),
  handleValidationErrors
];

const loginValidation = [
  body('email').isEmail().withMessage('รูปแบบอีเมลไม่ถูกต้อง'),
  body('password').notEmpty().withMessage('กรุณากรอกรหัสผ่าน'),
  handleValidationErrors
];

const scholarshipValidation = [
  body('name').notEmpty().withMessage('กรุณากรอกชื่อทุนการศึกษา'),
  body('category').isIn(['sit', 'kmutt', 'international']).withMessage('หมวดหมู่ไม่ถูกต้อง'),
  body('scholarship_type').isIn(['sit-merit', 'sit-activity', 'sit-work', 'kmutt-grant', 'kmutt-loan', 'kmutt-special', 'international']).withMessage('ประเภททุนไม่ถูกต้อง'),
  handleValidationErrors
];

const applicationValidation = [
  body('statement').isLength({ min: 50 }).withMessage('เหตุผลความจำเป็นต้องมีความยาวอย่างน้อย 50 ตัวอักษร'),
  body('family_income').isNumeric().withMessage('กรุณากรอกรายได้ครอบครัวเป็นตัวเลข'),
  handleValidationErrors
];

module.exports = {
  registerValidation,
  loginValidation,
  scholarshipValidation,
  applicationValidation
};
