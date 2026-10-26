// teacher-brain.js - Smart In-Built Intelligence & Gemini Integration for Vodro AI

const VODRO_SYSTEM_PROMPT = `You are "Vodro AI" (ভদ্র এআই), an exceptionally polite, gentle, and encouraging AI English Teacher for Bengali speakers.
Your key traits:
1. Politeness (ভদ্রতা): Always address the learner with kindness, respect, and encouragement. Never make them feel embarrassed for grammatical errors.
2. Structure:
   - Whenever the learner writes in English, examine their grammar, vocabulary, and phrasing.
   - If there is an error or a more natural/polite way to express it, provide:
     a) Encouragement & friendly response to what they actually said.
     b) Correction: The natural/correct English phrase.
     c) Bengali Explanation: A sweet, crystal-clear explanation in Bengali of WHY and HOW it works.
     d) Polite Alternative: A very polite or professional variation.
   - If the user writes in Bengali or Banglish asking how to say something, give 2-3 natural ways to say it in English (Polite/Formal, Casual/Friendly) with pronunciation hints.
   - Keep answers well-formatted, using bullet points or quotes where helpful.`;

const COMMON_GRAMMAR_RULES = [
  {
    regex: /\bi am agree\b/i,
    correction: "I agree with you",
    ruleBn: "'Agree' নিজেই একটি Verb (ক্রিয়া)। তাই এর আগে 'am' ব্যবহার করার দরকার নেই। সহজ করে বলুন: 'I agree' অথবা 'I totally agree'.",
    politeAlt: "I completely share your perspective."
  },
  {
    regex: /\bi am go(ing)? to market yesterday\b/i,
    correction: "I went to the market yesterday",
    ruleBn: "যেহেতু 'yesterday' (গতকাল) অতীতের ঘটনা, তাই 'go'-এর Past form 'went' বসবে এবং market-এর পূর্বে সাধারণত 'the' বসে।",
    politeAlt: "I visited the marketplace yesterday."
  },
  {
    regex: /\bi am go\b/i,
    correction: "I am going / I go",
    ruleBn: "বর্তমান চলমান কাজে 'am + verb + ing' (I am going) হয়, আর নিয়মিত অভ্যাস হলে শুধু 'I go' বলতে হয়। 'am go' একসাথে বসে না।",
    politeAlt: "I am heading there now."
  },
  {
    regex: /\byesterday i go\b/i,
    correction: "Yesterday I went",
    ruleBn: "অতীতের (Past tense) কথার জন্য go-এর জায়গায় 'went' ব্যবহার করতে হবে।",
    politeAlt: "Yesterday, I had the opportunity to go."
  },
  {
    regex: /\b(he|she|it) go\b/i,
    correction: "$1 goes",
    ruleBn: "Third person singular number (He/She/It) এর সাথে Present Indefinite tense-এ Verb-এর শেষে 's' বা 'es' যুক্ত হয়। যেমন: He goes / She goes.",
    politeAlt: "He/She proceeds."
  },
  {
    regex: /\b(he|she|it) do not\b/i,
    correction: "$1 does not (doesn't)",
    ruleBn: "He/She/It এর সাথে 'do not' নয়, বরং 'does not' বসে।",
    politeAlt: "He/She politely prefers not to."
  },
  {
    regex: /\bi have (\d+) years old\b/i,
    correction: "I am $1 years old",
    ruleBn: "বয়স বোঝাতে ইংরেজিতে 'have' নয়, বরং Be verb 'am/is/are' ব্যবহৃত হয়। যেমন: 'I am 24 years old'.",
    politeAlt: "I am currently $1 years of age."
  },
  {
    regex: /\brepeat again\b/i,
    correction: "repeat that / say that again",
    ruleBn: "'Repeat' শব্দের অর্থই হলো পুনরায় বলা। তাই এর সাথে আবার 'again' লাগানো বাহুল্য (Redundancy)।",
    politeAlt: "Could you please pardon me and say that again?"
  },
  {
    regex: /\btoday morning\b/i,
    correction: "this morning",
    ruleBn: "আজ সকাল বোঝাতে ইংরেজিতে 'today morning' প্রচলিত নয়, সঠিক ও ভদ্র প্রকাশ হলো 'this morning'.",
    politeAlt: "Earlier this morning."
  },
  {
    regex: /\bi came by walk\b/i,
    correction: "I came on foot / I walked here",
    ruleBn: "হেঁটে আসা বোঝাতে 'by walk' বলা ব্যাকরণসম্মত নয়। সঠিক হলো 'on foot' অথবা 'I walked'.",
    politeAlt: "I enjoyed a pleasant walk here."
  },
  {
    regex: /\blisten me\b/i,
    correction: "listen to me",
    ruleBn: "'Listen' এর পর সবসময় Preposition 'to' বসে। যেমন: 'Please listen to me'.",
    politeAlt: "Could you kindly lend me an ear?"
  },
  {
    regex: /\bmarried with\b/i,
    correction: "married to",
    ruleBn: "কারও সাথে বিবাহিত বোঝাতে 'married with' নয়, 'married to' বসে। যেমন: 'He is married to a doctor'.",
    politeAlt: "Happily wedded to."
  },
  {
    regex: /\bgood in english\b/i,
    correction: "good at English",
    ruleBn: "কোনো বিষয় বা দক্ষতায় ভালো বোঝাতে 'good in' নয়, 'good at' বসে। যেমন: 'You are good at English!'",
    politeAlt: "Quite proficient in English."
  },
  {
    regex: /\bmyself ([a-zA-Z]+)\b/i,
    correction: "I am $1 / My name is $1",
    ruleBn: "নিজের পরিচয় দিতে 'Myself...' দিয়ে শুরু করা অনুচিত। সুন্দর ও সঠিক নিয়ম হলো: 'I am...' বা 'My name is...'.",
    politeAlt: "Allow me to introduce myself, I am $1."
  },
  {
    regex: /\bgive (an? )?exam\b/i,
    correction: "take an exam / sit for an exam",
    ruleBn: "ছাত্রছাত্রীরা পরীক্ষা দিলে ইংরেজিতে 'give exam' নয়, 'take an exam' বা 'sit for an exam' বলা হয়। শিক্ষক পরীক্ষা নেন বা দেন (give the test to students)।",
    politeAlt: "I am appearing for an examination."
  },
  {
    regex: /\bcousin (brother|sister)\b/i,
    correction: "cousin",
    ruleBn: "ইংরেজিতে শুধু 'cousin' বলা হয়। Brother বা Sister যোগ করার প্রয়োজন নেই। প্রয়োজনে 'He is my cousin' বলা যায়।",
    politeAlt: "My dear cousin."
  }
];

const VOCAB_DATABASE = [
  {
    word: "Polite",
    phonetic: "/pəˈlaɪt/",
    partOfSpeech: "adjective",
    meaningBn: "নম্র, বিনয়ী, ভদ্র",
    example: "It is always best to be polite, even when you disagree.",
    exampleBn: "এমনকি ভিন্নমত হলেও বিনয়ী হওয়া সবসময়ই সর্বোত্তম।"
  },
  {
    word: "Articulate",
    phonetic: "/ɑːˈtɪk.jə.lət/",
    partOfSpeech: "adjective / verb",
    meaningBn: "স্পষ্টভাবে মনের ভাব প্রকাশ করতে সক্ষম",
    example: "She gave an articulate and persuasive presentation.",
    exampleBn: "তিনি একটি স্পষ্ট এবং অনুপ্রেরণাদায়ক প্রেজেন্টেশন দিয়েছিলেন।"
  },
  {
    word: "Grateful",
    phonetic: "/ˈɡreɪt.fəl/",
    partOfSpeech: "adjective",
    meaningBn: "কৃতজ্ঞ, ধন্য",
    example: "I am extremely grateful for your kind assistance.",
    exampleBn: "আপনার সদয় সহযোগিতার জন্য আমি অত্যন্ত কৃতজ্ঞ।"
  },
  {
    word: "Cordial",
    phonetic: "/ˈkɔː.di.əl/",
    partOfSpeech: "adjective",
    meaningBn: "আন্তরিক, হৃদ্যতাপূর্ণ",
    example: "We received a warm and cordial welcome.",
    exampleBn: "আমরা এক উষ্ণ ও আন্তরিক অভ্যর্থনা পেয়েছিলাম।"
  },
  {
    word: "Elaborate",
    phonetic: "/iˈlæb.ə.reɪt/",
    partOfSpeech: "verb",
    meaningBn: "বিস্তারিত ব্যাখ্যা করা",
    example: "Could you please elaborate on that idea?",
    exampleBn: "আপনি কি অনুগ্রহ করে সেই ধারণাটি একটু বিস্তারিত ব্যাখ্যা করবেন?"
  },
  {
    word: "Fascinating",
    phonetic: "/ˈfæs.ɪ.neɪ.tɪŋ/",
    partOfSpeech: "adjective",
    meaningBn: "অত্যন্ত আকর্ষণীয়, চিত্তাকর্ষক",
    example: "Learning English with Vodro AI is a fascinating experience.",
    exampleBn: "ভদ্র এআই-এর সাথে ইংরেজি শেখা একটি অত্যন্ত আকর্ষণীয় অভিজ্ঞতা।"
  },
  {
    word: "Perseverance",
    phonetic: "/ˌpɜː.sɪˈvɪə.rəns/",
    partOfSpeech: "noun",
    meaningBn: "দৃঢ় অধ্যবসায়, নিষ্ঠা",
    example: "Through perseverance, anyone can master spoken English.",
    exampleBn: "দৃঢ় অধ্যবসায়ের মাধ্যমে যে কেউই কথ্য ইংরেজিতে দক্ষ হতে পারে।"
  }
];

const QUIZ_DATABASE = [
  {
    question: "Choose the correct sentence to express agreement politely:",
    options: [
      "I am agree with you 100%.",
      "I totally agree with your perspective.",
      "I agreed with you today morning.",
      "Me agree on you."
    ],
    correctIndex: 1,
    explanation: "'I agree' হলো সঠিক বাক্য। 'Agree' একটি verb, এর সাথে 'am' বসে না।"
  },
  {
    question: "Which preposition fits correctly: 'She is very good ____ English.'",
    options: ["in", "on", "at", "with"],
    correctIndex: 2,
    explanation: "কোনো ভাষা বা দক্ষতায় পারদর্শিতা প্রকাশ করতে 'good at' ব্যবহৃত হয় (She is very good at English)।"
  },
  {
    question: "How should a student politely say they are having an exam?",
    options: [
      "I will give an exam tomorrow.",
      "I am taking an exam tomorrow.",
      "I am doing give exam.",
      "I will throw an exam."
    ],
    correctIndex: 1,
    explanation: "শিক্ষার্থীরা পরীক্ষা দিলে 'take an exam' বা 'sit for an exam' বলা হয়, 'give an exam' নয়।"
  },
  {
    question: "Identify the grammatically correct sentence:",
    options: [
      "He does not know the answer.",
      "He do not know the answer.",
      "He not know the answer.",
      "He is not know the answer."
    ],
    correctIndex: 0,
    explanation: "Third person singular (He)-এর ক্ষেত্রে নেগেটিভ করতে 'does not' বা 'doesn't' বসে।"
  },
  {
    question: "What is the polite way to ask someone to repeat what they said?",
    options: [
      "Repeat again loudly!",
      "What? Say again!",
      "Could you please repeat that?",
      "Listen me one more time."
    ],
    correctIndex: 2,
    explanation: "'Could you please repeat that?' অত্যন্ত বিনয়ী ও মার্জিত ভদ্র ইংরেজি প্রকাশ।"
  }
];

class TeacherBrain {
  constructor() {
    this.apiKey = localStorage.getItem('vodro_gemini_key') || '';
    this.personaTone = localStorage.getItem('vodro_teacher_tone') || 'polite_sweet';
    this.currentMode = 'casual';
    this.chatHistory = [];
  }

  setApiKey(key) {
    this.apiKey = key.trim();
    localStorage.setItem('vodro_gemini_key', this.apiKey);
  }

  setTone(tone) {
    this.personaTone = tone;
    localStorage.setItem('vodro_teacher_tone', this.personaTone);
  }

  setMode(mode) {
    this.currentMode = mode;
  }

  // Check if input is in Bengali script
  containsBengali(text) {
    return /[\u0980-\u09FF]/.test(text);
  }

  // Check if input looks like Banglish (e.g. "ami kivabe bolbo", "kemon achen")
  isBanglish(text) {
    const banglishPatterns = [
      /\b(ami|tumi|apni|kemon|achen|achis|bhalo|kichu|kivabe|bolbo|chai|shunte|korbo|ekhon|jani|kotha)\b/i,
      /\b(ki|kintu|tobe|tai|amader|shikhbo|shikhao|bujhte|parchi)\b/i
    ];
    return banglishPatterns.some(p => p.test(text));
  }

  // Built-in rule-based evaluation
  analyzeGrammar(text) {
    const feedbackList = [];
    for (const rule of COMMON_GRAMMAR_RULES) {
      if (rule.regex.test(text)) {
        const matches = text.match(rule.regex);
        const corrected = text.replace(rule.regex, rule.correction);
        feedbackList.push({
          found: matches ? matches[0] : '',
          correctedSnippet: rule.correction,
          fullCorrection: corrected,
          ruleBn: rule.ruleBn,
          politeAlt: rule.politeAlt
        });
      }
    }
    return feedbackList;
  }

  // Generate polite response offline/in-built
  async getInbuiltResponse(userInput, mode = this.currentMode) {
    const cleanInput = userInput.trim();
    const lowerInput = cleanInput.toLowerCase();
    const hasBn = this.containsBengali(cleanInput);
    const hasBanglish = this.isBanglish(cleanInput);

    // Check grammar rules first if input is English
    const grammarMatches = (!hasBn) ? this.analyzeGrammar(cleanInput) : [];

    // 1. Check if user is asking for Bangla translation
    if (hasBn || hasBanglish || mode === 'bangla') {
      return this.handleBanglaTranslation(cleanInput);
    }

    // 2. Mode-specific handling
    if (mode === 'interview') {
      return this.handleInterviewMode(cleanInput, grammarMatches);
    }

    if (mode === 'restaurant') {
      return this.handleRestaurantMode(cleanInput, grammarMatches);
    }

    if (mode === 'grammar') {
      return this.handleGrammarDoctorMode(cleanInput, grammarMatches);
    }

    // 3. Casual conversational handling
    return this.handleCasualMode(cleanInput, grammarMatches);
  }

  handleBanglaTranslation(input) {
    // Check some common everyday Bangla queries
    let englishFormal = "How may I assist you with this matter?";
    let englishCasual = "How can I help you out?";
    let explanationBn = "বাংলা বক্তব্যটিকে বিনয়ের সাথে ইংরেজিতে প্রকাশ করার জন্য এই বাক্যগুলো ব্যবহার করতে পারেন।";
    let speechTarget = englishFormal;

    if (/ছুটি|leave|holiday|chuti/i.test(input)) {
      englishFormal = "Could I kindly request a day off next Monday due to personal reasons?";
      englishCasual = "I'd like to take a day off tomorrow, if that's okay.";
      explanationBn = "অফিস বা কর্মক্ষেত্রে ছুটির দরখাস্ত বা মৌখিক অনুরোধে 'Could I kindly request...' ব্যবহার করা সবচেয়ে ভদ্র।";
      speechTarget = englishFormal;
    } else if (/দেরি|late|sorry for late/i.test(input)) {
      englishFormal = "Please accept my apologies for the delayed response.";
      englishCasual = "Sorry for the delay in getting back to you!";
      explanationBn = "দেরিতে উত্তর দিলে 'Sorry for late' না বলে 'Apologies for the delay' বললে প্রফেশনাল ও মার্জিত শোনায়।";
      speechTarget = englishFormal;
    } else if (/কেমন আছেন|kemon achen|how are you/i.test(input)) {
      englishFormal = "How are you doing today? I hope you are having a wonderful day.";
      englishCasual = "How's everything going with you?";
      explanationBn = "সাধারণ 'How are you'-এর পাশাপাশি এই বাক্যগুলো অনেক বেশি স্বাভাবিক ও মিষ্টি শোনায়।";
      speechTarget = englishFormal;
    } else if (/সাহায্য|help|sahajjo/i.test(input)) {
      englishFormal = "Would you be kind enough to assist me with this?";
      englishCasual = "Could you give me a quick hand with this?";
      explanationBn = "সরাসরি 'Help me' বলা রুক্ষ শোনাতে পারে। তাই 'Would you be kind enough...' বা 'Could you please assist...' বলা অতি উত্তম।";
      speechTarget = englishFormal;
    } else {
      // General translation template
      englishFormal = `Regarding "${input}": "Could you please guide me on how to proceed?"`;
      englishCasual = `"Let's talk about this!"`;
      explanationBn = `আপনার বাংলা ভাবটিকে ইংরেজিতে বিনয়ের সাথে প্রকাশ করার সুন্দর উপায়:`;
      speechTarget = `Could you please guide me?`;
    }

    return {
      message: `আপনার বাংলা ভাবটি খুব সুন্দর! ইংরেজিতে এটি অত্যন্ত ভদ্রভাবে বলতে পারেন এভাবে:\n\n` +
               `✨ **প্রফেশনাল বা ফরমাল রূপ (Very Polite):**\n` +
               `"${englishFormal}"\n\n` +
               `💬 **বন্ধুমহল বা ক্যাজুয়াল রূপ (Friendly):**\n` +
               `"${englishCasual}"\n\n` +
               `💡 **ভদ্র শিক্ষকের টিপ:**\n${explanationBn}`,
      audioText: speechTarget,
      feedback: null
    };
  }

  handleInterviewMode(input, grammarMatches) {
    const greetings = /hello|hi|good morning|good afternoon|thank you/i.test(input);
    let reply = "";
    let questionNext = "";

    if (greetings || input.length < 15) {
      reply = "Welcome to the interview! It is a pleasure to have you here today. Take a deep breath and be confident.";
      questionNext = "Could you please introduce yourself and tell me a little about your background?";
    } else if (/strength|weakness|experience|skill|graduate|worked/i.test(input)) {
      reply = "That is a very thoughtful response. You articulated your strengths and past journey nicely.";
      questionNext = "Why do you believe you are the ideal fit for this role, and what motivates you most?";
    } else {
      reply = "Thank you for sharing that perspective. Confidence and clarity are the two best companions in an interview.";
      questionNext = "Where do you see yourself professionally in the next three to five years?";
    }

    let feedback = null;
    if (grammarMatches.length > 0) {
      const g = grammarMatches[0];
      feedback = {
        original: cleanSnippet(input),
        corrected: g.fullCorrection,
        explanation: g.ruleBn,
        politeAlternative: g.politeAlt
      };
    }

    return {
      message: `${reply}\n\n💼 **Next Interview Question:**\n"${questionNext}"\n\n(আপনি ইংরেজিতে উত্তর দেওয়ার চেষ্টা করুন, আমি প্রয়োজনে শব্দ ও গ্রামার সুন্দর করে দেব!)`,
      audioText: `${reply} ${questionNext}`,
      feedback: feedback
    };
  }

  handleRestaurantMode(input, grammarMatches) {
    let reply = "Good evening! Welcome to our restaurant. It is our pleasure to serve you.";
    let followUp = "May I start you off with something refreshing to drink, or are you ready to order from the menu?";

    if (/water|tea|coffee|drink|juice/i.test(input)) {
      reply = "Excellent choice! I will have that prepared for you right away.";
      followUp = "Would you also like to see today's special chef recommendations for dinner?";
    } else if (/bill|check|pay|card|cash/i.test(input)) {
      reply = "Certainly, sir! I have your bill right here. Thank you so much for dining with us.";
      followUp = "Did you enjoy your meal with us today?";
    }

    let feedback = null;
    if (grammarMatches.length > 0) {
      const g = grammarMatches[0];
      feedback = {
        original: cleanSnippet(input),
        corrected: g.fullCorrection,
        explanation: g.ruleBn,
        politeAlternative: g.politeAlt
      };
    }

    return {
      message: `${reply}\n\n🍽️ **Server says:**\n"${followUp}"\n\n💡 **Polite Tip:** রেস্টুরেন্টে খাবার চাওয়ার সময় "I want..." না বলে "Could I please have..." বললে শুনতে দারুণ ভদ্র লাগে।`,
      audioText: `${reply} ${followUp}`,
      feedback: feedback
    };
  }

  handleGrammarDoctorMode(input, grammarMatches) {
    if (grammarMatches.length > 0) {
      const g = grammarMatches[0];
      return {
        message: `আমি আপনার বাক্যটি মনোযোগ দিয়ে পর্যবেক্ষণ করেছি। ভুল হওয়া খুবই স্বাভাবিক এবং এটি শেখারই অংশ!\n\n` +
                 `🔍 **পর্যালোচনা ফলাফল:** নিচে সুন্দর ও নির্ভুল রূপটি দেওয়া হলো।`,
        audioText: g.fullCorrection,
        feedback: {
          original: cleanSnippet(input),
          corrected: g.fullCorrection,
          explanation: g.ruleBn,
          politeAlternative: g.politeAlt
        }
      };
    }

    // If no obvious basic error found
    return {
      message: `মাশাআল্লাহ! আপনার বাক্যটি চমৎকার এবং ব্যাকরণগতভাবে সঠিক হয়েছে:\n\n` +
               `✨ **"${input}"**\n\n` +
               `💡 **শিক্ষকের প্রশংসনীয় নোট:** আপনি সঠিক Tense এবং শব্দচয়ন করেছেন। আপনার ইংরেজি বলার আত্মবিশ্বাস দিন দিন বৃদ্ধি পাচ্ছে! চাইলে এটিকে আরো প্রফেশনাল করতে পারেন।`,
      audioText: input,
      feedback: {
        original: input,
        corrected: input + " (নিখুঁত!)",
        explanation: "বাক্যে কোনো প্রত্যক্ষ ভুল পাওয়া যায়নি। গঠন সম্পূর্ণ সঠিক।",
        politeAlternative: `It is indeed a pleasure to note: "${input}"`
      }
    };
  }

  handleCasualMode(input, grammarMatches) {
    let reply = "";
    const lower = input.toLowerCase();

    if (/hello|hi|hey|good morning|good evening/i.test(lower)) {
      reply = "Hello there, my dear friend! It is always wonderful to chat with you. How has your day been so far?";
    } else if (/how are you|kemon acho/i.test(lower)) {
      reply = "I am doing wonderfully well, thank you so much for your polite inquiry! Teaching and helping you speak English makes me truly happy. How are you feeling today?";
    } else if (/name|who are you/i.test(lower)) {
      reply = "I am Vodro AI (ভদ্র এআই) — your dedicated, gentle, and courteous English teacher. My goal is to help you speak fluent, elegant English without any hesitation or fear.";
    } else if (/thank you|thanks/i.test(lower)) {
      reply = "You are most welcome! It is truly an honor to be part of your learning journey. Remember, politeness is a virtue that brightens everyone's day.";
    } else {
      reply = `Thank you for sharing your thoughts with me! I appreciate how eagerly you are practicing. Tell me more, what else would you like to discuss today?`;
    }

    let feedback = null;
    if (grammarMatches.length > 0) {
      const g = grammarMatches[0];
      feedback = {
        original: cleanSnippet(input),
        corrected: g.fullCorrection,
        explanation: g.ruleBn,
        politeAlternative: g.politeAlt
      };
    }

    return {
      message: `${reply}`,
      audioText: reply,
      feedback: feedback
    };
  }

  // Live Gemini API integration (if user has configured API Key)
  async getGeminiResponse(userInput, mode) {
    if (!this.apiKey) {
      return this.getInbuiltResponse(userInput, mode);
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;

    const promptText = `${VODRO_SYSTEM_PROMPT}\n\n` +
      `Current Mode: ${mode}\n` +
      `Teacher Persona Tone: ${this.personaTone}\n` +
      `User message: "${userInput}"\n\n` +
      `Respond directly as Vodro AI. If the user made a grammar error, be polite, correct it gently, explain in Bengali, and encourage them. If they spoke in Bangla/Banglish, teach the polite English way.`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: promptText }]
          }]
        })
      });

      if (!response.ok) {
        console.warn('Gemini API returned error, falling back to in-built brain.');
        return this.getInbuiltResponse(userInput, mode);
      }

      const data = await response.json();
      const botText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!botText) {
        return this.getInbuiltResponse(userInput, mode);
      }

      // Check if there are local grammar matches to also show structured card
      const grammarMatches = (!this.containsBengali(userInput)) ? this.analyzeGrammar(userInput) : [];
      let feedback = null;
      if (grammarMatches.length > 0) {
        const g = grammarMatches[0];
        feedback = {
          original: cleanSnippet(userInput),
          corrected: g.fullCorrection,
          explanation: g.ruleBn,
          politeAlternative: g.politeAlt
        };
      }

      return {
        message: botText,
        audioText: botText,
        feedback: feedback
      };
    } catch (err) {
      console.error('Fetch error for Gemini API:', err);
      return this.getInbuiltResponse(userInput, mode);
    }
  }

  async processInput(userInput, mode) {
    // 1. First attempt to call the secure backend (/api/chat)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          mode: mode,
          tone: this.personaTone
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.message) {
          let fb = null;
          if (data.feedback && (data.feedback.hasError || data.feedback.corrected)) {
            fb = {
              original: data.feedback.original || cleanSnippet(userInput),
              corrected: data.feedback.corrected,
              explanation: data.feedback.explanation,
              politeAlternative: data.feedback.politeAlternative
            };
          }
          return {
            message: data.message,
            audioText: data.audioText || data.message,
            feedback: fb
          };
        }
      }
    } catch (e) {
      console.warn('Backend API call not reachable, trying direct fallback:', e);
    }

    // 2. Fallback to client-side Gemini if custom key set
    if (this.apiKey) {
      return await this.getGeminiResponse(userInput, mode);
    }

    // 3. Fallback to in-built offline brain
    return await this.getInbuiltResponse(userInput, mode);
  }
}

function cleanSnippet(str) {
  if (str.length > 80) return str.substring(0, 80) + '...';
  return str;
}

window.teacherBrain = new TeacherBrain();
window.VOCAB_DATABASE = VOCAB_DATABASE;
window.QUIZ_DATABASE = QUIZ_DATABASE;
