export class VoiceAssistant {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

  static speak(text: string, onEnd?: () => void): boolean {
    if (!this.synth) {
      console.warn('Speech synthesis not supported in this browser environment');
      return false;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for elderly clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to pick a natural, gentle voice
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Jenny') || v.name.includes('George')) && v.lang.startsWith('en'));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.synth.speak(utterance);
    return true;
  }

  static stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  // Web Speech API speech recognition
  static listen(onResult: (transcript: string) => void, onError?: (err: any) => void): { stop: () => void } | null {
    if (typeof window === 'undefined') return null;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (onError) onError(new Error('Speech recognition not supported in this browser'));
      return null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      recognition.onerror = (event: any) => {
        if (onError) onError(event.error);
      };

      recognition.start();

      return {
        stop: () => {
          try {
            recognition.stop();
          } catch (e) {}
        }
      };
    } catch (err) {
      if (onError) onError(err);
      return null;
    }
  }
}
