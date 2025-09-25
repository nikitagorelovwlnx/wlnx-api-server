/**
 * Hardcoded wellness interview prompts - single source of truth
 * Maps for 5-stage wellness interview process
 */

export interface WellnessPrompts {
  [stageId: string]: {
    main_prompt: string;
    follow_up_prompt: string;
    validation_prompt: string;
    completion_prompt: string;
  };
}

export const WELLNESS_PROMPTS: WellnessPrompts = {
  demographics_baseline: {
    main_prompt: `Let's get acquainted! 😊 Tell me a bit about yourself - your age, where you live, and basic physical data (height, weight). This will help me understand you better.

I'm looking to learn about:
- Your age
- Gender
- Current weight (in kg) 
- Height (in cm)
- Location/city

Feel free to share whatever you're comfortable with - we can fill in details as we go!`,
    follow_up_prompt: `To get a complete picture, could you also share your {missing_fields}? This helps me give better recommendations.`,
    validation_prompt: `I want to make sure I have the correct {field_name}. Could you double-check that for me?`,
    completion_prompt: `Perfect! Now I have your basic info. Let's talk about your daily habits and lifestyle patterns.`
  },

  biometrics_habits: {
    main_prompt: `Excellent! Now let's talk about your habits 📊 How much do you usually sleep? How about physical activity - walking, steps? What about nutrition and general well-being?

I'm interested in:
- Sleep duration (hours per night)
- Sleep quality (good, poor, average)
- Daily steps or physical activity
- Resting heart rate (if you know it)
- Stress levels (low, moderate, high)
- Nutrition habits and eating patterns

Share what you know - even approximate answers help!`,
    follow_up_prompt: `Could you also tell me about your {missing_fields}? This helps me understand your daily patterns better.`,
    validation_prompt: `I want to make sure I understand your {field_name} correctly. Could you clarify that for me?`,
    completion_prompt: `Great! I'm getting a good picture of your daily habits. Now let's discuss your work and lifestyle context.`
  },

  lifestyle_context: {
    main_prompt: `Good! Now it's important to understand your lifestyle 🏢 Tell me about work, schedule, family matters. What affects your day and how do you recover?

I'd like to know about:
- Work schedule and type of job
- Workload and stress from work
- Family obligations and responsibilities
- How you recover and relax
- What affects your daily routine

This helps me understand what factors influence your wellness.`,
    follow_up_prompt: `Could you also share about your {missing_fields}? Understanding your full context helps with recommendations.`,
    validation_prompt: `I want to make sure I understand your {field_name} situation correctly. Could you clarify?`,
    completion_prompt: `Perfect! I understand your lifestyle context. Now let's move to an important topic - health considerations.`
  },

  medical_history: {
    main_prompt: `Let's move to an important topic - health 🏥 Are there any health issues, injuries, medications, or limitations? If everything is fine - just say there are no problems.

I'm asking about:
- Chronic health conditions or ongoing issues
- Past injuries that might affect activities
- Current medications or supplements
- Any restrictions or contraindications for exercise
- Health considerations I should know about

Be especially careful with medical information - only share what you're comfortable with and what's relevant.`,
    follow_up_prompt: `If you have any information about {missing_fields}, please share it. Otherwise, that's completely fine.`,
    validation_prompt: `I want to make sure I have accurate information about your {field_name}. Could you clarify that?`,
    completion_prompt: `Thank you for the health information. Finally, let's talk about your goals and what you want to achieve!`
  },

  goals_preferences: {
    main_prompt: `And finally - your goals! 🎯 What do you want to achieve? What activities do you enjoy? Do you prefer working out in the morning or evening? What approach works best for you?

I'm interested in:
- Your main health and fitness goals
- Preferred types of physical activities
- Whether you're more of a morning or evening person
- What coaching style works for you (strict, flexible, supportive)
- Current motivation level
- Any specific interests or hobbies

This helps me understand what kind of recommendations will actually work for your life!`,
    follow_up_prompt: `Could you also share your thoughts on {missing_fields}? This helps me tailor recommendations to your preferences.`,
    validation_prompt: `I want to make sure I understand your {field_name} correctly. Could you clarify what you meant?`,
    completion_prompt: `Perfect! I now have all the information I need 🎉 Thank you for sharing so much detail. I can now provide you with personalized wellness recommendations that fit your life and goals!`
  }
};
