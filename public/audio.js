// audio.js - Audio synthesis, sound effects & Web Speech API integration

class AudioManager {
  constructor() {
    this.soundEnabled = true;
    this.ctx = null;
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch (e) {
      console.warn('AudioContext not supported:', e);
    }
  }

  ensureContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPop() {
    if (!this.soundEnabled || !this.ctx) return;
    this.ensureContext();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  playChime() {
    if (!this.soundEnabled || !this.ctx) return;
    this.ensureContext();
    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.08, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.25);
      });
    } catch (e) {}
  }

  playSuccess() {
    if (!this.soundEnabled || !this.ctx) return;
    this.ensureContext();
    try {
      const now = this.ctx.currentTime;
      [587.33, 739.99, 880.00].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.15, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.35);
      });
    } catch (e) {}
  }

  playError() {
    if (!this.soundEnabled || !this.ctx) return;
    this.ensureContext();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.2);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }
}

class SpeechManager {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.currentAccent = 'US';
    this.voices = [];
    this.loadVoices();

    if (this.synth && this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices();
    }

    // Speech Recognition setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.hasRecognition = !!SpeechRecognition;
    if (this.hasRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    } else {
      this.recognition = null;
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  speak(text, accent = this.currentAccent) {
    if (!this.synth) return;
    this.synth.cancel();

    // Clean markdown or bangla out for English TTS if mixed
    const englishOnly = this.extractEnglishPortion(text) || text;
    const utterance = new SpeechSynthesisUtterance(englishOnly);
    utterance.rate = 0.92; // Slightly measured and clear for learning
    utterance.pitch = 1.0;

    let voiceLang = 'en-US';
    if (accent === 'UK') voiceLang = 'en-GB';
    else if (accent === 'IN') voiceLang = 'en-IN';

    const chosenVoice = this.voices.find(v => v.lang.replace('_', '-').includes(voiceLang) || v.lang.startsWith(voiceLang.split('-')[0])) || this.voices.find(v => v.lang.startsWith('en'));
    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  extractEnglishPortion(text) {
    // If the text has English quotes or correction blocks, extract the most relevant English sentence
    const quotesMatch = text.match(/"([^"]+)"/);
    if (quotesMatch && quotesMatch[1]) {
      return quotesMatch[1];
    }
    // Extract English sentences
    const englishLines = text.split('\n').filter(line => {
      // test if line is predominantly Latin/English letters
      const englishChars = (line.match(/[a-zA-Z]/g) || []).length;
      return englishChars > 5 && !line.includes('❌') && !line.includes('💡');
    });
    if (englishLines.length > 0) {
      return englishLines[0].replace(/[*_#`]/g, '').trim();
    }
    return text.replace(/[\u0980-\u09FF]/g, '').trim();
  }

  startListening(onResult, onError, onEnd) {
    if (!this.recognition) {
      onError('Speech Recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event) => {
      onError(event.error);
    };

    this.recognition.onend = () => {
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition start error:', e);
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }
}

window.audioManager = new AudioManager();
window.speechManager = new SpeechManager();
