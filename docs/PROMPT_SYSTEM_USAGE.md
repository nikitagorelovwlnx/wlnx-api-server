# Prompt Management System - Usage Guide

## Overview

The Prompt Management System allows you to store, version, and manage conversation prompts for 5-stage wellness interviews. The bot can retrieve dynamic prompts for each stage via API.

## 🚀 Quick Start

### 1. Import Default Wellness Prompts
```bash
curl -X POST http://localhost:3000/api/prompts/import/wellness
```

### 2. Get All Prompts for Bot
```bash
curl http://localhost:3000/api/prompts/forms/wellness_intake
```

### 3. Get Single Stage Prompt
```bash
curl http://localhost:3000/api/prompts/forms/wellness_intake/stages/S1_demographics
```

## 📋 5-Stage Interview Flow

### Stage 1: Demographics (S1_demographics)
**Collects:** Age, gender, weight, height
```javascript
const response = await fetch('/api/prompts/forms/wellness_intake/stages/S1_demographics');
const { data } = await response.json();

// Send main prompt
await bot.sendMessage(data.main_prompt);
// "Hello! I'm here to help you with your wellness journey. Let's start with some basic information about you..."

// If user provides incomplete data, use follow-up
await bot.sendMessage(data.follow_up_prompt.replace('{missing_fields}', 'your age and weight'));

// If validation fails
await bot.sendMessage(data.validation_prompt.replace('{field_name}', 'age'));

// When stage completes
await bot.sendMessage(data.completion_prompt);
```

### Stage 2: Lifestyle (S2_lifestyle)
**Collects:** Sleep duration, sleep quality, stress level, daily steps, work schedule
```javascript
const { data } = await fetch('/api/prompts/forms/wellness_intake/stages/S2_lifestyle').then(r => r.json());
await bot.sendMessage(data.main_prompt);
// "Now let's talk about your daily lifestyle. This helps me understand your current wellness patterns..."
```

### Stage 3: Health Goals (S3_health_goals)
**Collects:** Health goals, activity preferences, nutrition habits
```javascript
const { data } = await fetch('/api/prompts/forms/wellness_intake/stages/S3_health_goals').then(r => r.json());
await bot.sendMessage(data.main_prompt);
// "Understanding your goals and preferences is key to creating a personalized wellness plan..."
```

### Stage 4: Medical (S4_medical)
**Collects:** Chronic conditions, medications, contraindications, resting heart rate
```javascript
const { data } = await fetch('/api/prompts/forms/wellness_intake/stages/S4_medical').then(r => r.json());
await bot.sendMessage(data.main_prompt);
// "For your safety and to provide the best recommendations, I need to know about any medical considerations..."
```

### Stage 5: Additional (S5_additional)
**Collects:** Location and any other optional information
```javascript
const { data } = await fetch('/api/prompts/forms/wellness_intake/stages/S5_additional').then(r => r.json());
await bot.sendMessage(data.main_prompt);
// "We're almost done! Just one more thing that might help with personalized recommendations..."
```

## 🤖 Bot Integration Example

```javascript
class WellnessBot {
  async conductInterview(userId) {
    // Get all prompts for the interview
    const response = await fetch('/api/prompts/forms/wellness_intake');
    const { data } = await response.json();
    
    const userAnswers = {};
    
    // Conduct each stage
    for (const stage of data.stages) {
      const stageAnswers = await this.conductStage(stage, userAnswers);
      Object.assign(userAnswers, stageAnswers);
    }
    
    return userAnswers;
  }
  
  async conductStage(stage, currentAnswers) {
    const prompts = stage.prompts;
    const stageAnswers = {};
    
    // Send main prompt
    await this.sendMessage(prompts.main_prompt);
    
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      const userInput = await this.waitForUserInput();
      
      // Extract data using form schema validation
      const extractedData = await this.extractStageData(userInput, stage.targets);
      
      if (this.isStageComplete(extractedData, stage.targets)) {
        // Stage completed successfully
        Object.assign(stageAnswers, extractedData);
        await this.sendMessage(prompts.completion_prompt);
        break;
      } else if (this.hasValidationErrors(extractedData)) {
        // Validation errors occurred
        const errorField = this.getFirstErrorField(extractedData);
        const validationMsg = prompts.validation_prompt
          .replace('{field_name}', errorField.name)
          .replace('{field_type}', errorField.type);
        await this.sendMessage(validationMsg);
      } else {
        // Need more information
        const missingFields = this.getMissingFields(extractedData, stage.targets);
        const followUpMsg = prompts.follow_up_prompt
          .replace('{missing_fields}', missingFields.join(', '));
        await this.sendMessage(followUpMsg);
      }
      
      attempts++;
    }
    
    return stageAnswers;
  }
}
```

## 📝 Prompt Customization

### Update Existing Prompt
```javascript
// Update a prompt's content
const promptId = 'existing-prompt-id';
await fetch(`/api/prompts/${promptId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: {
      main_prompt: 'Updated greeting message...'
    },
    metadata: {
      tone: 'professional'
    }
  })
});
```

### Create New Prompt Version
```javascript
// Create version 1.1.0 with updated content
await fetch('/api/prompts/forms/wellness_intake/stages/S1_demographics/versions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    version: '1.1.0',
    content: {
      main_prompt: 'Welcome! Let me help you on your wellness journey...'
    }
  })
});
```

### Create Custom Prompt
```javascript
// Create entirely new prompt for custom stage
await fetch('/api/prompts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Fitness Assessment',
    stage_id: 'S1_fitness',
    form_name: 'fitness_intake',
    version: '1.0.0',
    content: {
      main_prompt: 'Let\'s assess your current fitness level...',
      follow_up_prompt: 'Could you provide more details about {missing_fields}?',
      validation_prompt: 'The {field_name} seems incorrect. Please try again.',
      completion_prompt: 'Great! I have your fitness information.'
    },
    metadata: {
      tone: 'encouraging',
      style: 'conversational'
    }
  })
});
```

## 🎯 Advanced Usage Patterns

### A/B Testing Prompts
```javascript
// Deploy different prompt versions
const userGroup = getUserGroup(userId);
const version = userGroup === 'test' ? '1.1.0' : '1.0.0';

const response = await fetch(
  `/api/prompts/forms/wellness_intake?version=${version}`
);
```

### Multi-Language Support
```javascript
const userLocale = getUserLocale(userId); // 'en-US', 'es-ES', etc.
const response = await fetch(
  `/api/prompts/forms/wellness_intake?locale=${userLocale}`
);
```

### Dynamic Prompt Variables
```javascript
// Replace placeholders in prompts
function personalizePrompt(prompt, userData, missingFields) {
  return prompt
    .replace('{user_name}', userData.name || 'there')
    .replace('{missing_fields}', missingFields.join(' and '))
    .replace('{field_name}', currentField)
    .replace('{field_type}', getFieldType(currentField));
}

// Usage
const personalizedPrompt = personalizePrompt(
  data.follow_up_prompt,
  { name: 'John' },
  ['age', 'weight']
);
// Result: "Hi John, I still need your age and weight to continue..."
```

## 📊 Monitoring and Analytics

### Track Prompt Effectiveness
```javascript
// Log prompt usage for analytics
async function logPromptUsage(stageId, promptType, userId) {
  await fetch('/api/analytics/prompt-usage', {
    method: 'POST',
    body: JSON.stringify({
      stage_id: stageId,
      prompt_type: promptType, // 'main', 'follow_up', 'validation', 'completion'
      user_id: userId,
      timestamp: new Date().toISOString()
    })
  });
}

// Usage in bot
await this.sendMessage(prompts.main_prompt);
await logPromptUsage(stage.stage_id, 'main', userId);
```

## 🔧 Troubleshooting

### Common Issues

1. **Prompt Not Found**
   ```javascript
   // Always check if prompt exists
   const response = await fetch('/api/prompts/forms/wellness_intake/stages/S1_demographics');
   if (!response.ok) {
     // Fallback to default message
     await bot.sendMessage('Let\'s start with some basic information about you.');
   }
   ```

2. **Missing Prompt Variables**
   ```javascript
   // Safe variable replacement
   function safeReplace(text, variables) {
     return text.replace(/\{(\w+)\}/g, (match, key) => {
       return variables[key] || match; // Keep original if no replacement
     });
   }
   ```

3. **Version Conflicts**
   ```javascript
   // Always specify version for consistency
   const version = await getCurrentFormVersion('wellness_intake');
   const response = await fetch(`/api/prompts/forms/wellness_intake?version=${version}`);
   ```

The Prompt Management System provides flexible, dynamic conversation management for your bot while maintaining consistency and allowing easy updates without code changes!
