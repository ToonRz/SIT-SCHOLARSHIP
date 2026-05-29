const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      'SELECT gpa, year_of_study, semester, department, faculty FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const student = users[0];

    if (!student.gpa || !student.year_of_study) {
      return res.status(400).json({
        message: 'Please update GPA and year in profile first',
        requiresProfile: true
      });
    }

    const [scholarships] = await pool.query(
      "SELECT * FROM scholarships WHERE status = 'open' AND category = 'sit' ORDER BY created_at DESC"
    );

    if (scholarships.length === 0) {
      return res.json([]);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';

    if (!apiKey) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is not configured' });
    }

    const scholarshipList = scholarships.map((s, i) => {
      return `Scholarship ${i + 1}: ${s.name} | Description: ${s.description} | Eligibility: ${s.eligibility} | Benefits: ${s.benefits} | Documents: ${s.required_documents}`;
    }).join('\n');

    const promptText = `You are a scholarship advisor for SIT KMUTT.
Student academic profile (PDPA — no personal identifiers):
- Year: ${student.year_of_study}
- Semester: ${student.semester || 'Not specified'}
- GPA: ${student.gpa}
- Department: ${student.department || 'Not specified'}

Available scholarships:
${scholarshipList}

Analyze and recommend the 3 best matching scholarships for this student based on GPA, year, and eligibility criteria.

Return ONLY valid JSON array (no markdown):
[
  {
    "id": scholarship_id,
    "name": "scholarship name",
    "score": matching_score_0_to_100,
    "reasons": ["reason 1", "reason 2"]
  }
]`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errText);
      return res.status(500).json({ message: 'AI connection error' });
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return res.status(500).json({ message: 'No response from AI' });
    }

    let recommendations;
    try {
      const cleanedText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      recommendations = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, responseText);
      return res.status(500).json({ message: 'Failed to parse AI response' });
    }

    const results = recommendations.slice(0, 3).map(rec => {
      const scholarship = scholarships.find(s => s.id === rec.id || s.name === rec.name);
      if (scholarship) {
        return {
          id: scholarship.id,
          name: scholarship.name,
          matchScore: rec.score,
          reasons: rec.reasons || [],
          scholarship_type: scholarship.scholarship_type,
          benefits: scholarship.benefits
        };
      }
      return null;
    }).filter(Boolean);

    if (results.length === 0 && scholarships.length > 0) {
      return res.json([{
        id: scholarships[0].id,
        name: scholarships[0].name,
        matchScore: 50,
        reasons: ['Open scholarship available'],
        scholarship_type: scholarships[0].scholarship_type,
        benefits: scholarships[0].benefits
      }]);
    }

    return res.json(results);
  } catch (error) {
    console.error('Recommendations error:', error.message);
    console.error('Stack:', error.stack);
    return res.status(500).json({ message: 'Scholarship analysis error' });
  }
});

module.exports = router;