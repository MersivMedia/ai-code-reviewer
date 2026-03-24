const { OpenAI } = require('openai');

let openai;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text: inputData } = req.body;

    if (!inputData || inputData.trim().length === 0) {
        return res.status(400).json({ error: 'Input text is required' });
    }

    try {
        // Demo mode fallback when no API key
        if (!openai) {
            return res.json({
                result: `**CODE REVIEW RESULTS**\n\n**Overall Assessment:** Good structure with room for optimization\n\n**✅ Strengths:**\n• Clean function organization and readable variable names\n• Proper error handling with try-catch blocks\n• Good separation of concerns\n\n**⚠️ Issues Found:**\n\n**1. PERFORMANCE (Medium Priority)**\n```python\n# Line 23: Inefficient loop\nfor user in all_users:  # O(n²) complexity\n    if user.id == target_id:\n        return user\n```\n**Recommendation:** Use dictionary lookup or database index\n\n**2. SECURITY (High Priority)**\n```python\n# Line 45: SQL injection vulnerability\nquery = f\"SELECT * FROM users WHERE name = '{user_input}'\"\n```\n**Fix:** Use parameterized queries\n\n**3. ERROR HANDLING (Low Priority)**\n• Add specific exception types instead of bare except\n• Include logging for debugging\n\n**📈 Suggested Improvements:**\n• Add input validation\n• Implement caching for frequent database calls\n• Add unit tests for edge cases\n• Consider async/await for I/O operations\n\n**🔒 Security Score:** 7/10\n**⚡ Performance Score:** 6/10\n**🧹 Code Quality Score:** 8/10`,
                demo: true,
                message: "This is a demo response. Add OPENAI_API_KEY environment variable for live AI generation."
            });
        }

        // Real OpenAI API call
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a senior software engineer and code review expert with 10+ years of experience across multiple languages and frameworks. Provide thorough, constructive code reviews focusing on bugs, performance, security, maintainability, and best practices.`
                },
                {
                    role: "user", 
                    content: inputData
                }
            ],
            max_tokens: 2000,
            temperature: 0.7,
        });

        const result = completion.choices[0].message.content;

        res.json({
            result: result,
            demo: false
        });

    } catch (error) {
        console.error('Error:', error);
        
        // Fallback to demo response on error
        res.json({
            result: `**CODE REVIEW RESULTS**\n\n**Overall Assessment:** Good structure with room for optimization\n\n**✅ Strengths:**\n• Clean function organization and readable variable names\n• Proper error handling with try-catch blocks\n• Good separation of concerns\n\n**⚠️ Issues Found:**\n\n**1. PERFORMANCE (Medium Priority)**\n```python\n# Line 23: Inefficient loop\nfor user in all_users:  # O(n²) complexity\n    if user.id == target_id:\n        return user\n```\n**Recommendation:** Use dictionary lookup or database index\n\n**2. SECURITY (High Priority)**\n```python\n# Line 45: SQL injection vulnerability\nquery = f\"SELECT * FROM users WHERE name = '{user_input}'\"\n```\n**Fix:** Use parameterized queries\n\n**3. ERROR HANDLING (Low Priority)**\n• Add specific exception types instead of bare except\n• Include logging for debugging\n\n**📈 Suggested Improvements:**\n• Add input validation\n• Implement caching for frequent database calls\n• Add unit tests for edge cases\n• Consider async/await for I/O operations\n\n**🔒 Security Score:** 7/10\n**⚡ Performance Score:** 6/10\n**🧹 Code Quality Score:** 8/10`,
            demo: true,
            message: "Temporary issue with AI service. Showing demo response.",
            error: error.message
        });
    }
}