// app.js - Main Application Controller for Vodro AI

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const messagesArea = document.getElementById('messages-area');
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const btnSend = document.getElementById('btn-send');
  const btnVoiceInput = document.getElementById('btn-voice-input');
  const voiceListeningBar = document.getElementById('voice-listening-bar');
  const btnStopListening = document.getElementById('btn-stop-listening');
  const btnClearChat = document.getElementById('btn-clear-chat');
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const btnSidebarToggle = document.getElementById('btn-sidebar-toggle');
  const sidebar = document.getElementById('sidebar');

  // Mode Elements
  const modeButtons = document.querySelectorAll('.mode-btn');
  const currentModeDisplay = document.getElementById('current-mode-display');
  const modeBannerIcon = document.getElementById('mode-banner-icon');
  const modeBannerTitle = document.getElementById('mode-banner-title');
  const modeBannerDesc = document.getElementById('mode-banner-desc');
  const topicSuggestions = document.getElementById('topic-suggestions');
  const quickChipsRow = document.getElementById('quick-chips-row');

  // Voice & Settings
  const accentSelect = document.getElementById('accent-select');
  const autoSpeakToggle = document.getElementById('auto-speak-toggle');

  // Modals
  const vocabModal = document.getElementById('vocab-modal');
  const quizModal = document.getElementById('quiz-modal');
  const apiModal = document.getElementById('api-modal');

  const btnVocabModal = document.getElementById('btn-vocab-modal');
  const btnQuizModal = document.getElementById('btn-quiz-modal');
  const btnApiKeyModal = document.getElementById('btn-api-key-modal');

  const btnCloseVocab = document.getElementById('btn-close-vocab');
  const btnCloseQuiz = document.getElementById('btn-close-quiz');
  const btnCloseApi = document.getElementById('btn-close-api');

  const btnNextVocab = document.getElementById('btn-next-vocab');
  const vocabContent = document.getElementById('vocab-content');
  const quizContent = document.getElementById('quiz-content');

  const geminiApiKeyInput = document.getElementById('gemini-api-key');
  const aiToneSelect = document.getElementById('ai-tone');
  const btnSaveApi = document.getElementById('btn-save-api');
  const btnClearApi = document.getElementById('btn-clear-api');

  // State
  let currentMode = 'casual';
  let isListening = false;
  let autoSpeak = false;
  let currentVocabIndex = 0;
  let currentQuizIndex = 0;
  let quizScore = 0;

  const MODE_METADATA = {
    casual: {
      title: "Casual English Practice",
      desc: "ভয় নেই! সাধারণ কথা বলুন, আমি প্রতিটি বাক্য সুন্দর ও নির্ভুল করে দেব।",
      icon: "☕",
      display: "মোড: Casual English • প্রস্তুত",
      topics: ["How was your day?", "Tell me about your hobbies", "What is your favorite food?"],
      chips: [
        { label: "👋 'Hello Vodro Sir!'", text: "Hello Vodro Sir! How are you today?" },
        { label: "☕ 'My favorite hobby'", text: "My favorite hobby is reading books and listening music." },
        { label: "🌦️ 'About the weather'", text: "The weather today is very nice and cool." }
      ]
    },
    interview: {
      title: "Job Interview Preparation",
      desc: "প্রফেশনাল ইন্টারভিউ প্রশ্নের প্রস্তুতি নিন এবং আত্মবিশ্বাসী উত্তর দিন।",
      icon: "💼",
      display: "মোড: Job Interview • সক্রিয়",
      topics: ["Introduce yourself", "Why should we hire you?", "Describe your strengths"],
      chips: [
        { label: "🎯 'Introduce myself'", text: "Allow me to introduce myself to you." },
        { label: "💡 'My strengths'", text: "I am a quick learner and a dedicated team player." },
        { label: "❓ 'Ask the interviewer'", text: "What are the biggest challenges for this role?" }
      ]
    },
    grammar: {
      title: "Grammar Doctor & Sentence Fixer",
      desc: "আপনার যেকোনো ইংরেজি বাক্য লিখুন, ভদ্র AI নিখুঁতভাবে শুধরে দেবে।",
      icon: "🩺",
      display: "মোড: Grammar Doctor • সক্রিয়",
      topics: ["I am go to market", "Yesterday I meet him", "I agree with you"],
      chips: [
        { label: "🩺 'Check: I am go'", text: "I am go to market yesterday." },
        { label: "🩺 'Check: Myself Rahim'", text: "Myself Rahim and I am 22 years old." },
        { label: "🩺 'Check: He do not'", text: "He do not like to give exam." }
      ]
    },
    bangla: {
      title: "Bangla to Polite English",
      desc: "বাংলা বা বাংলিশে মনের কথা লিখুন, শিখে নিন চমৎকার ভদ্র ইংরেজি রূপ।",
      icon: "🇧🇩",
      display: "মোড: Bangla to English • সক্রিয়",
      topics: ["অফিসে ছুটির আবেদন", "দেরিতে উত্তরের জন্য দুঃখ প্রকাশ", "বিনয়ের সাথে অনুরোধ"],
      chips: [
        { label: "🏖️ 'ছুটি চাওয়ার ইংরেজি'", text: "আমি কিভাবে অফিসে ভদ্রভাবে ২ দিনের ছুটি চাইবো?" },
        { label: "⏰ 'দেরিতে উত্তরের ক্ষমা'", text: "দেরিতে মেসেজের রিপ্লাই দেওয়ার জন্য ভদ্রভাবে কি বলবো?" },
        { label: "🤝 'সাহায্য চাওয়ার নিয়ম'", text: "কাউকে বিরক্ত না করে সাহায্য চাওয়ার সুন্দর ইংরেজি কি?" }
      ]
    },
    restaurant: {
      title: "Restaurant & Travel English",
      desc: "বিদেশে রেস্টুরেন্টে খাবার অর্ডার ও হোটেল/এয়ারপোর্টে সহজ কথোপকথন।",
      icon: "🍽️",
      display: "মোড: Restaurant & Travel • সক্রিয়",
      topics: ["Ordering food politely", "Asking for the check", "Flight check-in"],
      chips: [
        { label: "🍽️ 'Order food'", text: "Could I please order a chicken sandwich and iced tea?" },
        { label: "💳 'Ask for bill'", text: "Could we have the bill, please?" },
        { label: "✈️ 'Window seat'", text: "Could I kindly request a window seat for my flight?" }
      ]
    }
  };

  // Initial Welcome Message
  function displayWelcomeMessage() {
    const welcomeHtml = `
      <p>আসসালামু আলাইকুম ও নমস্কার! আমি <strong>Vodro AI (ভদ্র AI)</strong> — আপনার সার্বক্ষণিক মার্জিত ও বিনয়ী ইংরেজি শিক্ষক। 🎓</p>
      <br>
      <p>ইংরেজি বলতে বা শিখতে গিয়ে ভুল হওয়া খুবই স্বাভাবিক। আমার কাছে আপনি নির্ভয়ে যেকোনো বাক্য লিখতে পারেন। আমি কখনো ভুল নিয়ে উপহাস করব না, বরং পরম যত্নে সুন্দর ও ভদ্র রূপটি বুঝিয়ে দেব।</p>
      <br>
      <p>💡 <em>আপনি শুরু করতে পারেন:</em></p>
      <ul style="padding-left: 1.2rem; margin-top: 0.3rem;">
        <li>প্রতিদিনের সাধারণ ইংরেজি কথা বলে</li>
        <li>যেকোনো ইংরেজি বাক্যের ব্যাকরণ পরীক্ষা করিয়ে</li>
        <li>অথবা বাংলায় লিখে তার স্মার্ট ইংরেজি অনুবাদ জেনে নিয়ে!</li>
      </ul>
    `;

    appendMessage({
      sender: 'bot',
      content: welcomeHtml,
      tag: 'স্বাগতম • Welcome',
      audioText: "Hello and welcome! I am Vodro AI, your polite English teacher. Feel free to speak or write in English without any hesitation. I am here to help you learn with care."
    });
  }

  // Auto-resize textarea
  userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
  });

  // Handle Form Submit
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    // Play Pop sound
    window.audioManager.playPop();

    // User Message
    appendMessage({
      sender: 'user',
      content: escapeHtml(text)
    });

    userInput.value = '';
    userInput.style.height = 'auto';
    userInput.focus();

    // Show Typing Indicator
    const typingIndicator = showTypingIndicator();

    try {
      // Process through teacher brain
      const response = await window.teacherBrain.processInput(text, currentMode);

      // Remove typing indicator
      typingIndicator.remove();

      // Play Chime
      window.audioManager.playChime();

      // Render Bot Message
      appendMessage({
        sender: 'bot',
        content: formatBotContent(response.message),
        feedback: response.feedback,
        audioText: response.audioText || response.message,
        tag: 'ভদ্র শিক্ষক • Vodro Teacher'
      });

      // Auto speak if enabled
      if (autoSpeak && response.audioText) {
        window.speechManager.speak(response.audioText, accentSelect.value);
      }

    } catch (err) {
      typingIndicator.remove();
      console.error(err);
      appendMessage({
        sender: 'bot',
        content: `ক্ষমা করবেন, সাময়িক ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন। (${err.message})`,
        tag: 'সতর্কতা'
      });
    }
  });

  // Enter key handling (Shift+Enter for newline, Enter to send)
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      chatForm.dispatchEvent(new Event('submit'));
    }
  });

  // Append Message to Messages Area
  function appendMessage({ sender, content, feedback = null, audioText = null, tag = null }) {
    const row = document.createElement('div');
    row.className = `message-row ${sender}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'bot' ? '🤵' : '👤';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    let headerHtml = '';
    if (sender === 'bot') {
      headerHtml = `
        <div class="bubble-header">
          <span class="bubble-tag">✨ ${tag || 'Vodro AI'}</span>
          <div class="bubble-actions">
            ${audioText ? `<button class="btn-speak-text" title="উচ্চারণ শুনুন (Listen)">🔊</button>` : ''}
          </div>
        </div>
      `;
    }

    let feedbackHtml = '';
    if (feedback) {
      feedbackHtml = `
        <div class="feedback-card">
          <div class="feedback-row">
            <span class="feedback-label label-original">❌ আপনার বাক্য:</span>
            <div class="feedback-value">${escapeHtml(feedback.original)}</div>
          </div>
          <div class="feedback-row">
            <span class="feedback-label label-corrected">✨ সঠিক ও মার্জিত রূপ:</span>
            <div class="feedback-value value-corrected">${escapeHtml(feedback.corrected)}</div>
          </div>
          <div class="feedback-row">
            <span class="feedback-label label-tip">💡 ব্যাকরণ ব্যাখ্যা (Bengali Rule):</span>
            <div class="feedback-value value-tip">${escapeHtml(feedback.explanation)}</div>
          </div>
          ${feedback.politeAlternative ? `
            <div class="feedback-row">
              <span class="feedback-label label-meaning">🎩 আরও ভদ্র প্রফেশনাল বিকল্প:</span>
              <div class="feedback-value" style="color: #93c5fd;">"${escapeHtml(feedback.politeAlternative)}"</div>
            </div>
          ` : ''}
        </div>
      `;
    }

    bubble.innerHTML = `
      ${headerHtml}
      <div class="message-text">${content}</div>
      ${feedbackHtml}
    `;

    // Speak button listener
    if (sender === 'bot' && audioText) {
      const speakBtn = bubble.querySelector('.btn-speak-text');
      if (speakBtn) {
        speakBtn.addEventListener('click', () => {
          window.speechManager.speak(audioText, accentSelect.value);
        });
      }
    }

    row.appendChild(avatar);
    row.appendChild(bubble);
    messagesArea.appendChild(row);

    // Scroll to bottom
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  // Typing Indicator
  function showTypingIndicator() {
    const row = document.createElement('div');
    row.className = 'message-row bot';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '🤵';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble typing-bubble';
    bubble.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;

    row.appendChild(avatar);
    row.appendChild(bubble);
    messagesArea.appendChild(row);
    messagesArea.scrollTop = messagesArea.scrollHeight;
    return row;
  }

  // Format Bot Content (Markdown bullets, bold, quotes)
  function formatBotContent(rawText) {
    if (!rawText) return '';
    let formatted = rawText
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background: rgba(0,0,0,0.3); padding: 0.15rem 0.35rem; border-radius: 4px; font-family: monospace;">$1</code>');

    // Replace newlines with <br> where appropriate
    formatted = formatted.split('\n').join('<br>');
    return formatted;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Switch Mode
  function setMode(modeKey) {
    currentMode = modeKey;
    window.teacherBrain.setMode(modeKey);

    modeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === modeKey);
    });

    const meta = MODE_METADATA[modeKey] || MODE_METADATA.casual;
    currentModeDisplay.textContent = meta.display;
    modeBannerIcon.textContent = meta.icon;
    modeBannerTitle.textContent = meta.title;
    modeBannerDesc.textContent = meta.desc;

    // Update topic suggestions in banner
    topicSuggestions.innerHTML = '';
    meta.topics.forEach(topic => {
      const tag = document.createElement('span');
      tag.className = 'topic-tag';
      tag.textContent = topic;
      tag.addEventListener('click', () => {
        userInput.value = topic;
        userInput.focus();
      });
      topicSuggestions.appendChild(tag);
    });

    // Update Quick Chips Row
    quickChipsRow.innerHTML = '';
    meta.chips.forEach(chip => {
      const chipBtn = document.createElement('button');
      chipBtn.type = 'button';
      chipBtn.className = 'chip-btn';
      chipBtn.textContent = chip.label;
      chipBtn.addEventListener('click', () => {
        userInput.value = chip.text;
        chatForm.dispatchEvent(new Event('submit'));
      });
      quickChipsRow.appendChild(chipBtn);
    });

    // Mobile sidebar close on mode pick
    if (window.innerWidth <= 900) {
      sidebar.classList.remove('open');
    }
  }

  // Mode button click events
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      setMode(btn.dataset.mode);
    });
  });

  // Speech Recognition (Voice Input)
  btnVoiceInput.addEventListener('click', () => {
    if (!isListening) {
      isListening = true;
      btnVoiceInput.classList.add('recording');
      voiceListeningBar.style.display = 'flex';

      window.speechManager.startListening(
        (transcript) => {
          userInput.value = transcript;
          isListening = false;
          btnVoiceInput.classList.remove('recording');
          voiceListeningBar.style.display = 'none';
          chatForm.dispatchEvent(new Event('submit'));
        },
        (error) => {
          console.warn('Speech Recognition error:', error);
          isListening = false;
          btnVoiceInput.classList.remove('recording');
          voiceListeningBar.style.display = 'none';
        },
        () => {
          isListening = false;
          btnVoiceInput.classList.remove('recording');
          voiceListeningBar.style.display = 'none';
        }
      );
    } else {
      window.speechManager.stopListening();
      isListening = false;
      btnVoiceInput.classList.remove('recording');
      voiceListeningBar.style.display = 'none';
    }
  });

  btnStopListening.addEventListener('click', () => {
    window.speechManager.stopListening();
    isListening = false;
    btnVoiceInput.classList.remove('recording');
    voiceListeningBar.style.display = 'none';
  });

  // Clear Chat
  btnClearChat.addEventListener('click', () => {
    if (confirm('আপনি কি পুরো কথোপকথন ক্লিয়ার করতে চান?')) {
      messagesArea.innerHTML = '';
      displayWelcomeMessage();
    }
  });

  // Sound Toggle
  btnSoundToggle.addEventListener('click', () => {
    window.audioManager.soundEnabled = !window.audioManager.soundEnabled;
    btnSoundToggle.textContent = window.audioManager.soundEnabled ? '🔔' : '🔕';
    btnSoundToggle.title = window.audioManager.soundEnabled ? 'সাউন্ড অন' : 'সাউন্ড অফ';
  });

  // Sidebar Toggle on Mobile
  btnSidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // Auto Speak Toggle
  autoSpeakToggle.addEventListener('change', (e) => {
    autoSpeak = e.target.checked;
  });

  // Accent selector
  accentSelect.addEventListener('change', (e) => {
    window.speechManager.currentAccent = e.target.value;
  });

  // Word of the Day Modal
  function renderVocabCard(index) {
    const item = window.VOCAB_DATABASE[index % window.VOCAB_DATABASE.length];
    vocabContent.innerHTML = `
      <div class="vocab-word-title">
        <span>${item.word}</span>
        <button class="btn-speak-text" id="btn-speak-vocab" title="উচ্চারণ শুনুন">🔊</button>
      </div>
      <div style="display: flex; gap: 0.5rem; align-items: center; margin-top: -0.5rem;">
        <span class="vocab-phonetic">${item.phonetic}</span>
        <span class="vocab-pos">${item.partOfSpeech}</span>
      </div>
      <div class="vocab-meaning-bn">বাংলা অর্থ: ${item.meaningBn}</div>

      <div class="vocab-detail-box">
        <div style="font-size: 0.75rem; color: #a5b4fc; font-weight: 600; text-transform: uppercase;">সুন্দর উদাহরণ বাক্য:</div>
        <div class="vocab-example-sentence">"${item.example}"</div>
        <div class="vocab-example-bn">${item.exampleBn}</div>
      </div>
    `;

    const speakBtn = document.getElementById('btn-speak-vocab');
    if (speakBtn) {
      speakBtn.addEventListener('click', () => {
        window.speechManager.speak(`${item.word}. ${item.example}`, accentSelect.value);
      });
    }
  }

  btnVocabModal.addEventListener('click', () => {
    renderVocabCard(currentVocabIndex);
    vocabModal.style.display = 'flex';
  });

  btnNextVocab.addEventListener('click', () => {
    currentVocabIndex++;
    renderVocabCard(currentVocabIndex);
  });

  btnCloseVocab.addEventListener('click', () => {
    vocabModal.style.display = 'none';
  });

  // Quiz Modal
  function renderQuizQuestion(index) {
    const total = window.QUIZ_DATABASE.length;
    const qIndex = index % total;
    const q = window.QUIZ_DATABASE[qIndex];

    quizContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-dim); margin-bottom: 0.5rem;">
        <span>প্রশ্ন ${qIndex + 1} / ${total}</span>
        <span>স্কোর: <strong style="color: #34d399;">${quizScore}</strong></span>
      </div>
      <div class="quiz-question-box">${q.question}</div>
      <div class="quiz-options-list" id="quiz-options">
        ${q.options.map((opt, i) => `
          <button class="quiz-option-btn" data-index="${i}">
            <span>${opt}</span>
            <span class="opt-indicator">⭕</span>
          </button>
        `).join('')}
      </div>
      <div id="quiz-explanation-area" style="margin-top: 1rem; display: none;"></div>
      <div style="margin-top: 1rem; text-align: right; display: none;" id="quiz-next-container">
        <button class="btn-primary" id="btn-quiz-next">পরবর্তী প্রশ্ন ➔</button>
      </div>
    `;

    const optionButtons = quizContent.querySelectorAll('.quiz-option-btn');
    const explanationArea = document.getElementById('quiz-explanation-area');
    const nextContainer = document.getElementById('quiz-next-container');
    const btnQuizNext = document.getElementById('btn-quiz-next');

    optionButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const selected = parseInt(btn.dataset.index, 10);
        // Disable all buttons
        optionButtons.forEach(b => b.disabled = true);

        if (selected === q.correctIndex) {
          btn.classList.add('correct');
          btn.querySelector('.opt-indicator').textContent = '✅';
          quizScore++;
          window.audioManager.playSuccess();
        } else {
          btn.classList.add('wrong');
          btn.querySelector('.opt-indicator').textContent = '❌';
          optionButtons[q.correctIndex].classList.add('correct');
          optionButtons[q.correctIndex].querySelector('.opt-indicator').textContent = '✅';
          window.audioManager.playError();
        }

        explanationArea.style.display = 'block';
        explanationArea.className = 'quiz-explanation-box';
        explanationArea.innerHTML = `<strong>💡 ব্যাখ্যা:</strong> ${q.explanation}`;

        nextContainer.style.display = 'block';
      });
    });

    btnQuizNext.addEventListener('click', () => {
      currentQuizIndex++;
      renderQuizQuestion(currentQuizIndex);
    });
  }

  btnQuizModal.addEventListener('click', () => {
    quizScore = 0;
    currentQuizIndex = 0;
    renderQuizQuestion(0);
    quizModal.style.display = 'flex';
  });

  btnCloseQuiz.addEventListener('click', () => {
    quizModal.style.display = 'none';
  });

  // API Modal
  btnApiKeyModal.addEventListener('click', () => {
    geminiApiKeyInput.value = window.teacherBrain.apiKey;
    aiToneSelect.value = window.teacherBrain.personaTone;
    apiModal.style.display = 'flex';
  });

  btnCloseApi.addEventListener('click', () => {
    apiModal.style.display = 'none';
  });

  btnSaveApi.addEventListener('click', () => {
    window.teacherBrain.setApiKey(geminiApiKeyInput.value);
    window.teacherBrain.setTone(aiToneSelect.value);
    apiModal.style.display = 'none';
    alert('সেটিংস সফলভাবে সংরক্ষিত হয়েছে! Vodro AI এখন আপনার পছন্দের কনফিগারেশনে প্রস্তুত।');
  });

  btnClearApi.addEventListener('click', () => {
    window.teacherBrain.setApiKey('');
    geminiApiKeyInput.value = '';
    alert('API Key মুছে ফেলা হয়েছে। Vodro AI এখন এর নিজস্ব স্মার্ট ইন-বিল্ট ব্রেন ব্যবহার করবে।');
  });

  // Close modals on clicking outside
  [vocabModal, quizModal, apiModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });

  // Initialize
  setMode('casual');
  displayWelcomeMessage();
});
