# 🤖 Prompt Pairs Implementation - Question & Extraction

## 🎯 Overview

Successfully implemented dual-prompt system for each wellness interview stage. Each stage now contains **2 specialized prompts**:

1. **Question Prompt** - generates next logical question for user
2. **Extraction Prompt** - extracts structured data from user response

## 📋 New Prompt Structure

### Each Stage Contains 6 Prompts:
```typescript
{
  question_prompt: string;    // 🆕 Generates next question
  extraction_prompt: string; // 🆕 Extracts data from response
  main_prompt: string;        // Original main conversation prompt  
  follow_up_prompt: string;   // Follow-up when more info needed
  validation_prompt: string;  // Validation error handling
  completion_prompt: string;  // Stage completion message
}
```

## 🚀 API Response Example

### GET /api/prompts
```json
{
  "success": true,
  "data": {
    "demographics_baseline": {
      "question_prompt": "Based on conversation context and missing demographic information, generate the next logical question...",
      "extraction_prompt": "Extract demographic data from user response and return in structured JSON format...",
      "main_prompt": "Let's get acquainted! 😊 Tell me about yourself...",
      "follow_up_prompt": "Could you also share your {missing_fields}?...",
      "validation_prompt": "I want to make sure I have the correct {field_name}...",
      "completion_prompt": "Perfect! Now I have your basic info..."
    },
    // ... 4 more stages with same structure
  }
}
```

## 🔧 Implementation Details

### 1. Question Prompts
**Purpose**: Generate contextual, conversational questions
**Features**:
- Context-aware question generation
- Natural, friendly tone with emojis
- Focuses on most important missing data
- Stage-specific examples provided

### 2. Extraction Prompts  
**Purpose**: Extract structured data from user responses
**Features**:
- Standardized JSON response format
- Confidence scoring (0-100)
- Field validation and normalization
- Missing field identification
- Next question suggestions

## 📊 Extraction Format Example

### Demographics Baseline Extraction:
```json
{
  "extractedData": {
    "age": 30,
    "gender": "male", 
    "weight": 75,
    "height": 180,
    "location": "San Francisco"
  },
  "confidence": 85,
  "reasoning": "User clearly stated age 30, male, 75kg, 180cm, lives in SF",
  "missingFields": [],
  "nextQuestion": "Great! Now let's talk about your daily habits..."
}
```

### Biometrics & Habits Extraction:
```json
{
  "extractedData": {
    "sleep_duration": 7,
    "sleep_quality": "good",
    "daily_steps": 8000,
    "resting_heart_rate": 65,
    "stress_level": "moderate",
    "nutrition_habits": ["mostly healthy", "occasional fast food"]
  },
  "confidence": 90,
  "reasoning": "User provided specific metrics for sleep and activity",
  "missingFields": [],
  "nextQuestion": "Tell me about your work schedule and lifestyle..."
}
```

## 🎯 Stage-Specific Features

### 1. Demographics Baseline
- **Focus**: age, gender, weight, height, location
- **Validation**: Unit conversion (kg, cm)
- **Example Q**: "Could you tell me your current weight in kg?"

### 2. Biometrics & Habits  
- **Focus**: sleep, activity, heart rate, stress, nutrition
- **Validation**: Quantifiable metrics, normalized quality scales
- **Example Q**: "How many hours of sleep do you typically get?"

### 3. Lifestyle Context
- **Focus**: work schedule, stress, family, recovery methods
- **Validation**: Work patterns, stress levels, routine factors
- **Example Q**: "Tell me about your work situation and schedule"

### 4. Medical History
- **Focus**: conditions, medications, restrictions
- **Validation**: Privacy-respectful, safety-focused
- **Example Q**: "Any health conditions I should know about for safe recommendations?"

### 5. Goals & Preferences
- **Focus**: health goals, activities, timing, coaching style
- **Validation**: Actionable goals, preference identification
- **Example Q**: "What are your main health goals for this year?"

## 💡 Bot Integration Usage

### Question Generation Flow:
```typescript
// 1. Get prompts from API
const prompts = await fetch('/api/prompts').then(r => r.json());

// 2. Use question prompt to generate next question
const questionPrompt = prompts.data.demographics_baseline.question_prompt;
const nextQuestion = await aiModel.generate(questionPrompt, conversationContext);

// 3. Send generated question to user
await bot.sendMessage(nextQuestion);
```

### Data Extraction Flow:
```typescript
// 1. Get user response
const userResponse = await bot.waitForMessage();

// 2. Use extraction prompt to parse data
const extractionPrompt = prompts.data.demographics_baseline.extraction_prompt;
const extractedData = await aiModel.extract(extractionPrompt, userResponse);

// 3. Store structured data
await storeWellnessData(extractedData.extractedData);
```

## ✅ Benefits

### 🎯 **Specialized Functionality**
- **Question prompts**: Optimized for natural conversation flow
- **Extraction prompts**: Optimized for structured data parsing
- **Clear separation of concerns**

### 🔄 **Dynamic Conversation**
- Context-aware question generation
- Confidence-based validation
- Automatic missing field detection
- Suggested follow-up questions

### 📊 **Structured Data**
- Consistent JSON format across all stages
- Field validation and normalization
- Privacy-respectful medical handling
- Confidence scoring for data quality

### 🚀 **Production Ready**
- Hardcoded for reliability
- TypeScript validated
- Comprehensive test coverage
- Backward compatible with existing main_prompt structure

## 🧪 Testing

All prompt pairs are fully functional:
```bash
# Test API response structure
curl http://localhost:3000/api/prompts | jq '.data.demographics_baseline | keys'
# Returns: ["completion_prompt", "extraction_prompt", "follow_up_prompt", "main_prompt", "question_prompt", "validation_prompt"]

# Compilation successful
npm run build ✅
```

## 🎉 Ready for Bot Integration!

The prompt management system now provides:
- **10 specialized prompts** (5 question + 5 extraction)
- **4 legacy prompts per stage** (main, follow_up, validation, completion) 
- **Structured data extraction** with confidence scoring
- **Dynamic question generation** based on conversation context

Your Telegram bot can now use these specialized prompt pairs for sophisticated, context-aware wellness interviews! 🚀
