export default [
  // Multiple Choice Questions for Rocket Propulsion Quiz
  {
    "_id": "QQ101",
    "quizId": "Q101",
    "title": "Rocket Equation",
    "points": 5,
    "questionType": "MULTIPLE_CHOICE",
    "questionText": "Which equation correctly represents the ideal rocket equation?",
    "position": 0,
    "choices": [
      { "_id": "C1", "text": "Δv = ve * ln(m0/mf)" },
      { "_id": "C2", "text": "Δv = ve * (m0/mf)" },
      { "_id": "C3", "text": "Δv = ve * ln(mf/m0)" },
      { "_id": "C4", "text": "Δv = ve * (mf/m0)" }
    ],
    "correctChoiceIndex": 0
  },
  {
    "_id": "QQ102",
    "quizId": "Q101",
    "title": "Fuel Types",
    "points": 5,
    "questionType": "MULTIPLE_CHOICE",
    "questionText": "Which of the following is NOT commonly used as rocket fuel?",
    "position": 1,
    "choices": [
      { "_id": "C1", "text": "Liquid Hydrogen" },
      { "_id": "C2", "text": "Liquid Oxygen" },
      { "_id": "C3", "text": "Mercury" },
      { "_id": "C4", "text": "RP-1 (Refined Petroleum)" }
    ],
    "correctChoiceIndex": 2
  },
  
  // True/False Question for Rocket Propulsion Quiz
  {
    "_id": "QQ103",
    "quizId": "Q101",
    "title": "Newton's Third Law",
    "points": 5,
    "questionType": "TRUE_FALSE",
    "questionText": "Rocket propulsion is a direct application of Newton's Third Law of Motion.",
    "position": 2,
    "correctAnswer": true
  },
  
  // Fill in the Blank Question for Rocket Propulsion Quiz
  {
    "_id": "2324a1e4-b6bd-45b9-b7b8-45c5c781ae97",
    "quizId": "Q101",
    "title": "Specific Impulse",
    "points": 5,
    "questionType": "FILL_BLANK",
    "questionText": "The efficiency of a rocket engine is measured using a parameter called ________.",
    "position": 3,
    "possibleAnswers": ["specific impulse", "Isp"]
  },
  
  // Multiple Choice Questions for Aerodynamics Midterm
  {
    "_id": "QQ201",
    "quizId": "Q102",
    "title": "Bernoulli's Principle",
    "points": 10,
    "questionType": "MULTIPLE_CHOICE",
    "questionText": "According to Bernoulli's principle, as the velocity of a fluid increases:",
    "position": 0,
    "choices": [
      { "_id": "C1", "text": "Its pressure increases" },
      { "_id": "C2", "text": "Its pressure decreases" },
      { "_id": "C3", "text": "Its pressure remains constant" },
      { "_id": "C4", "text": "Its temperature increases" }
    ],
    "correctChoiceIndex": 1
  },
  
  // True/False Question for Aerodynamics Midterm
  {
    "_id": "QQ202",
    "quizId": "Q102",
    "title": "Reynolds Number",
    "points": 10,
    "questionType": "TRUE_FALSE",
    "questionText": "A higher Reynolds number indicates more turbulent flow.",
    "position": 1,
    "correctAnswer": true
  },
  
  // Multiple Choice Questions for Organic Chemistry Practice Quiz
  {
    "_id": "QQ301",
    "quizId": "Q103",
    "title": "Functional Groups",
    "points": 5,
    "questionType": "MULTIPLE_CHOICE",
    "questionText": "Which functional group is characterized by a carbon-oxygen double bond?",
    "position": 0,
    "choices": [
      { "_id": "C1", "text": "Alcohol" },
      { "_id": "C2", "text": "Amine" },
      { "_id": "C3", "text": "Carbonyl" },
      { "_id": "C4", "text": "Ether" }
    ],
    "correctChoiceIndex": 2
  },
  
  // Fill in the Blank Question for Organic Chemistry Practice Quiz
  {
    "_id": "QQ302",
    "quizId": "Q103",
    "title": "IUPAC Naming",
    "points": 5,
    "questionType": "FILL_BLANK",
    "questionText": "The IUPAC name for CH₃CH₂OH is ________.",
    "position": 1,
    "possibleAnswers": ["ethanol", "ethyl alcohol"]
  }
]