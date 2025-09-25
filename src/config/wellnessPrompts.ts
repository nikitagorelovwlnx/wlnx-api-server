/**
 * Hardcoded wellness interview prompts - single source of truth
 * Maps for 5-stage wellness interview process
 */

export interface WellnessPrompts {
  [stageId: string]: {
    question_prompt: string;    // Генерирует следующий вопрос пользователю
    extraction_prompt: string; // Извлекает данные из ответа пользователя
  };
}

export const WELLNESS_PROMPTS: WellnessPrompts = {
  demographics_baseline: {
    question_prompt: `Based on the current conversation context and missing demographic information, generate the next logical question to ask the user. 

Focus on collecting: age, gender, weight, height, location.

Consider what has already been collected and ask for the most important missing piece. Keep questions natural, friendly, and conversational. Use emojis appropriately.

Example: "Great! Now could you tell me your current weight in kg? This helps me understand your health baseline better 📊"`,

    extraction_prompt: `Extract demographic data from the user's response and return it in structured JSON format.

TASK: Extract specific demographic data from user response
RETURN FORMAT:
{
  "extractedData": {
    "age": number | null,
    "gender": "male" | "female" | "other" | null,
    "weight": number | null,
    "height": number | null,
    "location": string | null
  },
  "confidence": number (0-100),
  "reasoning": "What was extracted and why",
  "missingFields": ["field1", "field2"],
  "nextQuestion": "Suggested next question to ask"
}

RULES:
- Only extract explicitly mentioned data
- Convert units: weight to kg, height to cm
- Be conservative - if unsure, return null
- Provide confidence score based on clarity`
  },

  biometrics_habits: {
    question_prompt: `Based on the conversation context and missing biometric/habit information, generate the next logical question about daily habits and health metrics.

Focus on collecting: sleep_duration, sleep_quality, daily_steps, resting_heart_rate, stress_level, nutrition_habits.

Keep questions natural and encouraging. Ask about the most important missing metric for health assessment.

Example: "How many hours of sleep do you typically get per night? Sleep is such a key foundation for everything else! 😴"`,

    extraction_prompt: `Extract biometric and habit data from the user's response and return in structured JSON format.

TASK: Extract biometric and daily habit data
RETURN FORMAT:
{
  "extractedData": {
    "sleep_duration": number | null,
    "sleep_quality": "poor" | "average" | "good" | null,
    "daily_steps": number | null,
    "resting_heart_rate": number | null,
    "stress_level": "low" | "moderate" | "high" | null,
    "nutrition_habits": string[] | null
  },
  "confidence": number (0-100),
  "reasoning": "What biometric data was extracted",
  "missingFields": ["field1", "field2"],
  "nextQuestion": "Suggested next biometric question"
}

RULES:
- Extract quantifiable metrics (hours, steps, BPM)
- Normalize sleep quality to: poor/average/good
- Stress level: low/moderate/high
- Nutrition habits as array of strings`
  },

  lifestyle_context: {
    question_prompt: `Generate a contextual question about the user's lifestyle factors that impact their wellness.

Focus on collecting: work_schedule, workload stress, family obligations, recovery methods, daily routine factors.

Ask about the most relevant lifestyle factor that affects their health and wellness potential.

Example: "Tell me about your work situation - do you have a regular schedule or does it vary a lot? Work-life balance plays such a big role in overall wellness! 💼"`,

    extraction_prompt: `Extract lifestyle and work context data from the user's response.

TASK: Extract lifestyle factors affecting wellness
RETURN FORMAT:
{
  "extractedData": {
    "work_schedule": string | null,
    "work_stress_level": "low" | "moderate" | "high" | null,
    "family_obligations": string | null,
    "recovery_methods": string[] | null,
    "daily_routine_factors": string[] | null
  },
  "confidence": number (0-100),
  "reasoning": "What lifestyle context was extracted",
  "missingFields": ["field1", "field2"],
  "nextQuestion": "Suggested next lifestyle question"
}

RULES:
- Capture work patterns and stress levels
- Note family/social obligations
- Document recovery and relaxation methods
- Identify daily routine influencers`
  },

  medical_history: {
    question_prompt: `Generate a sensitive, appropriate question about the user's medical history and health considerations.

Focus on collecting: chronic_conditions, past injuries, medications, exercise restrictions, relevant health factors.

Be respectful and emphasize that sharing is optional. Focus on information relevant to wellness recommendations.

Example: "Are there any health conditions, medications, or past injuries I should know about when making wellness suggestions? Only share what you're comfortable with - this helps me give safer recommendations 🏥"`,

    extraction_prompt: `Extract medical and health-related information from the user's response with high sensitivity to privacy.

TASK: Extract relevant medical history for wellness planning
RETURN FORMAT:
{
  "extractedData": {
    "chronic_conditions": string[] | null,
    "past_injuries": string[] | null,
    "current_medications": string[] | null,
    "exercise_restrictions": string[] | null,
    "health_considerations": string[] | null
  },
  "confidence": number (0-100),
  "reasoning": "What medical information was shared",
  "missingFields": ["field1", "field2"],
  "nextQuestion": "Suggested sensitive follow-up question"
}

RULES:
- Respect privacy - only extract what's explicitly shared
- Note any exercise or activity restrictions
- Document medications that might affect recommendations
- Be conservative with medical interpretations`
  },

  goals_preferences: {
    question_prompt: `Generate an engaging question about the user's health goals, activity preferences, and personal wellness style.

Focus on collecting: health_goals, activity_preferences, timing preferences, coaching style, motivation level, specific interests.

Make this inspiring and forward-looking - we're building toward their ideal wellness plan.

Example: "What are your main health goals for this year? Whether it's more energy, better sleep, or getting stronger - knowing your 'why' helps me suggest the best path forward! 🎯"`,

    extraction_prompt: `Extract goals, preferences, and motivational information from the user's response.

TASK: Extract wellness goals and personal preferences
RETURN FORMAT:
{
  "extractedData": {
    "health_goals": string[] | null,
    "activity_preferences": string[] | null,
    "time_preferences": "morning" | "evening" | "flexible" | null,
    "coaching_style": "strict" | "flexible" | "supportive" | null,
    "motivation_level": "low" | "moderate" | "high" | null,
    "specific_interests": string[] | null
  },
  "confidence": number (0-100),
  "reasoning": "What goals and preferences were identified",
  "missingFields": ["field1", "field2"],
  "nextQuestion": "Suggested motivational follow-up question"
}

RULES:
- Capture specific, actionable goals
- Note activity and timing preferences  
- Identify motivational factors and style preferences
- Focus on what will sustain long-term engagement`
  }
};




