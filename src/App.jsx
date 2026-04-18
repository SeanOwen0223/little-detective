import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Volume2,
  Lock,
  Star,
  Check,
  Puzzle,
  Home,
  RotateCcw,
  BookOpen,
  User,
  Music,
  Mic,
  ArrowLeft,
  Pause,
  X,
  Trophy,
  PlayCircle,
  CheckCircle2,
  Settings as SettingsIcon
} from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

function pcmToWav(pcmData, sampleRate) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const wavData = new Uint8Array(44 + pcmData.length);
  const view = new DataView(wavData.buffer);

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcmData.length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, pcmData.length, true);
  wavData.set(pcmData, 44);

  return wavData;
}

const uiText = {
  ENGLISH: {
    title1: 'LITTLE',
    title2: 'DETECTIVE',
    instructions: 'INSTRUCTIONS',
    settings: 'SETTINGS',
    volume: 'VOLUME',
    bgm: 'BACKGROUND MUSIC',
    sfx: 'SOUND EFFECTS',
    voice: 'VOICE NARRATION',
    language: 'LANGUAGE',
    howToPlay: 'HOW TO PLAY',
    inst1: "Listen to the character's clue carefully.",
    inst2: "Read the question and review the evidence.",
    inst3: "Select the correct location and check your answer.",
    inst4: "Solve cases to collect puzzle pieces!",
    lvlSelect: 'LEVEL SELECTION',
    lvlPrefix: 'LEVEL',
    back: 'BACK',
    puzzleProg: 'PUZZLE PROGRESS',
    playAudio: 'PLAY CLUE AUDIO',
    loading: 'LOADING...',
    checkAns: 'CHECK\nANSWER',
    feedbackWait: 'Feedback appears here',
    feedbackNoAns: 'Please select an answer first!',
    feedbackWrong: 'Oops! Try looking somewhere else.',
    paused: 'PAUSED',
    resume: 'RESUME',
    caseComplete: 'CASE COMPLETE!',
    greatJob: 'Great job, Detective!',
    playNext1: 'PLAY',
    playNext2: 'NEXT LEVEL',
    playAgain: 'PLAY AGAIN'
  },
  TAGALOG: {
    title1: 'MUNTING',
    title2: 'DETEKTIB',
    instructions: 'MGA PANUTO',
    settings: 'MGA SETTING',
    volume: 'LAKAS NG TUNOG',
    bgm: 'MUSIKA',
    sfx: 'SOUND EFFECTS',
    voice: 'BOSES NG NAGSASALAYSAY',
    language: 'WIKA',
    howToPlay: 'PAANO MAGLARO',
    inst1: 'Pakinggan nang mabuti ang pahiwatig ng tauhan.',
    inst2: 'Basahin ang tanong at suriin ang ebidensya.',
    inst3: 'Piliin ang tamang lokasyon at suriin ang iyong sagot.',
    inst4: 'Lutasin ang mga kaso para mangolekta ng puzzle!',
    lvlSelect: 'PAGPILI NG ANTAS',
    lvlPrefix: 'ANTAS',
    back: 'BUMALIK',
    puzzleProg: 'PROGRESO NG PUZZLE',
    playAudio: 'IPLEY ANG AUDIO',
    loading: 'NAGLO-LOAD...',
    checkAns: 'SURIIN\nANG SAGOT',
    feedbackWait: 'Dito lalabas ang resulta',
    feedbackNoAns: 'Pumili muna ng sagot!',
    feedbackWrong: 'Naku! Subukan maghanap sa ibang lugar.',
    paused: 'NAKA-PAUSE',
    resume: 'ITULOY',
    caseComplete: 'KASO LUTAS NA!',
    greatJob: 'Magaling, Detektib!',
    playNext1: 'SUSUNOD',
    playNext2: 'NA ANTAS',
    playAgain: 'MAGLARO MULI'
  }
};

const mockLevels = [
  {
    id: 1,
    ENGLISH: {
      character: 'THE JANITOR',
      clue: 'I was cleaning the hallway early this morning. I saw the Golden Trophy in the display case near the office. Everything looked normal at that time. I finished cleaning around 7:00 AM. After that, I went to the storage room to get more supplies.',
      question: 'Where did the janitor see the trophy?',
      choices: ['In the storage room', 'In the display case near the office', 'In the classroom']
    },
    TAGALOG: {
      character: 'ANG JANITOR',
      clue: 'Naglilinis ako ng hallway kaninang madaling araw. Nakita ko ang Golden Trophy sa display case malapit sa opisina. Mukhang normal naman ang lahat noon. Natapos akong maglinis bandang 7:00 AM. Pagkatapos nun, pumunta ako sa storage room para kumuha ng iba pang gamit.',
      question: 'Saan nakita ng janitor ang trophy?',
      choices: ['Sa storage room', 'Sa display case malapit sa opisina', 'Sa classroom']
    },
    correct: 1
  },
  {
    id: 2,
    ENGLISH: {
      character: 'A STUDENT',
      clue: 'I was practicing for the school program in the auditorium at 8:00 AM. I walked past the office and noticed the display case was empty. I thought maybe the teachers moved the trophy for the celebration.',
      question: 'What did the student notice?',
      choices: ['The trophy was shining', 'The display case was empty', 'The janitor was cleaning']
    },
    TAGALOG: {
      character: 'ISANG ESTUDYANTE',
      clue: 'Nagpapraktis ako para sa programa ng paaralan sa auditorium noong 8:00 AM. Dumaan ako sa opisina at napansin kong walang laman ang display case. Akala ko siguro inilipat ng mga guro ang trophy para sa pagdiriwang.',
      question: 'Ano ang napansin ng estudyante?',
      choices: ['Kumikinang ang trophy', 'Walang laman ang display case', 'Naglilinis ang janitor']
    },
    correct: 1
  },
  {
    id: 3,
    ENGLISH: {
      character: 'THE TEACHER',
      clue: 'I remember asking two students to help me decorate the stage. We needed space for the awards table. I told them to carefully carry some items from the hallway.',
      question: 'Why did the teacher ask students for help?',
      choices: ['To clean the classroom', 'To decorate the stage', 'To open the library']
    },
    TAGALOG: {
      character: 'ANG GURO',
      clue: 'Naalala ko na humingi ako ng tulong sa dalawang estudyante para mag-ayos ng stage. Kailangan namin ng espasyo para sa mesa ng parangal. Sinabihan ko silang mag-ingat sa pagbuhat ng ilang gamit mula sa hallway.',
      question: 'Bakit humingi ng tulong ang guro sa mga estudyante?',
      choices: ['Para linisin ang classroom', 'Para ayusin ang stage', 'Para buksan ang library']
    },
    correct: 1
  },
  {
    id: 4,
    ENGLISH: {
      character: 'A STUDENT HELPER',
      clue: 'I helped carry some boxes and decorations. My friend carried something shiny from the hallway. I think it was the trophy. We brought everything near the art room.',
      question: 'Where did the students bring the shiny object?',
      choices: ['The library', 'The art room', 'The cafeteria']
    },
    TAGALOG: {
      character: 'ESTUDYANTENG TUMUTULONG',
      clue: 'Tumulong akong magbuhat ng ilang kahon at dekorasyon. Ang kaibigan ko ay may binuhat na makintab mula sa hallway. Tingin ko iyon ang trophy. Dinala namin ang lahat malapit sa art room.',
      question: 'Saan dinala ng mga estudyante ang makintab na bagay?',
      choices: ['Sa library', 'Sa art room', 'Sa cafeteria']
    },
    correct: 1
  },
  {
    id: 5,
    ENGLISH: {
      character: 'THE ART TEACHER',
      clue: 'I was preparing paint and posters in the art room this morning. I saw students placing decorations inside a cabinet to keep them safe. The cabinet is tall and brown.',
      question: 'Where were the decorations placed?',
      choices: ['Inside a cabinet', 'Under the table', 'On the floor']
    },
    TAGALOG: {
      character: 'GURO SA SINING',
      clue: 'Naghahanda ako ng pintura at mga poster sa art room kaninang umaga. Nakita ko ang mga estudyanteng inilalagay ang mga dekorasyon sa loob ng isang cabinet. Ang cabinet ay mataas at kulay brown.',
      question: 'Saan inilagay ang mga dekorasyon?',
      choices: ['Sa loob ng cabinet', 'Sa ilalim ng mesa', 'Sa sahig']
    },
    correct: 0
  },
  {
    id: 6,
    ENGLISH: {
      character: 'THE SCHOOL GUARD',
      clue: 'I was guarding the school gate since 6:30 AM. I did not see anyone leave the school carrying a trophy. Everyone who entered and left had small bags only.',
      question: 'What did the guard NOT see?',
      choices: ['A student running', 'Someone carrying a trophy outside', 'A teacher decorating']
    },
    TAGALOG: {
      character: 'ANG GUWARDIYA',
      clue: 'Nagbabantay ako sa gate ng paaralan mula 6:30 AM. Wala akong nakitang lumabas ng paaralan na may dalang trophy. Ang lahat ng pumasok at lumabas ay may maliliit na bag lamang.',
      question: 'Ano ang HINDI nakita ng guwardiya?',
      choices: ['Isang estudyanteng tumatakbo', 'May nagdadala ng trophy sa labas', 'Isang guro na nag-aayos']
    },
    correct: 1
  },
  {
    id: 7,
    ENGLISH: {
      character: 'THE LIBRARIAN',
      clue: 'I opened the library at 7:30 AM. Some students came in to print posters. They talked about helping decorate the stage. They looked busy but not worried.',
      question: 'What were the students doing in the library?',
      choices: ['Printing posters', 'Hiding the trophy', 'Eating snacks']
    },
    TAGALOG: {
      character: 'ANG LIBRARIAN',
      clue: 'Binuksan ko ang library ng 7:30 AM. May mga estudyanteng pumasok para mag-print ng posters. Pinag-usapan nila ang pagtulong sa pag-aayos ng stage. Mukha silang abala pero hindi nag-aalala.',
      question: 'Ano ang ginagawa ng mga estudyante sa library?',
      choices: ['Nagpi-print ng posters', 'Tinatago ang trophy', 'Kumakain ng meryenda']
    },
    correct: 0
  },
  {
    id: 8,
    ENGLISH: {
      character: 'THE JANITOR',
      clue: 'Later that morning, I cleaned near the art room. I noticed the cabinet door was slightly open. I did not check inside because I was in a hurry.',
      question: 'What did the janitor notice near the art room?',
      choices: ['A broken window', 'An open cabinet door', 'A missing chair']
    },
    TAGALOG: {
      character: 'ANG JANITOR',
      clue: 'Kinalaunan nang umagang iyon, naglinis ako malapit sa art room. Napansin kong bahagyang nakabukas ang pinto ng cabinet. Hindi ko na tiningnan ang loob dahil nagmamadali ako.',
      question: 'Ano ang napansin ng janitor malapit sa art room?',
      choices: ['Isang basag na bintana', 'Isang nakabukas na pinto ng cabinet', 'Isang nawawalang upuan']
    },
    correct: 1
  },
  {
    id: 9,
    ENGLISH: {
      character: 'THE TEACHER',
      clue: 'When we finished decorating, I realized we forgot to return some items to the hallway. We were rushing to prepare for the program.',
      question: 'Why did they forget to return the items?',
      choices: ['They were tired', 'They were rushing', 'They were confused']
    },
    TAGALOG: {
      character: 'ANG GURO',
      clue: 'Nang matapos kaming mag-ayos, naisip kong nakalimutan naming ibalik ang ilang gamit sa hallway. Nagmamadali kami na maghanda para sa programa.',
      question: 'Bakit nila nakalimutang ibalik ang mga gamit?',
      choices: ['Sila ay pagod', 'Sila ay nagmamadali', 'Sila ay naguguluhan']
    },
    correct: 1
  },
  {
    id: 10,
    ENGLISH: {
      character: 'FINAL CLUE',
      clue: 'After checking all the clues, we opened the tall brown cabinet in the art room. Inside, we found the Golden Trophy safe and shiny. It was placed there by mistake during decoration.',
      question: 'Where was the trophy found?',
      choices: ['In the art room cabinet', 'At the school gate', 'In the library']
    },
    TAGALOG: {
      character: 'HULING PAHIWATIG',
      clue: 'Pagkatapos suriin ang lahat ng pahiwatig, binuksan namin ang mataas na kulay brown na cabinet sa art room. Sa loob, natagpuan namin ang Golden Trophy na ligtas at makintab. Inilagay ito roon nang hindi sinasadya habang nag-aayos.',
      question: 'Saan natagpuan ang trophy?',
      choices: ['Sa cabinet ng art room', 'Sa gate ng paaralan', 'Sa library']
    },
    correct: 0
  }
];

const playSound = (type, volume) => {
  if (volume <= 0) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  const vol = volume / 100;

  if (type === 'click') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(vol, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } else if (type === 'success') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2);
    gainNode.gain.setValueAtTime(vol, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } else if (type === 'error') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    gainNode.gain.setValueAtTime(vol, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }
};

const fallbackSpeech = (text, volume, lang) => {
  if (volume <= 0 || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.volume = volume / 100;
  utterance.rate = 0.9;
  utterance.pitch = 1.2;
  utterance.lang = lang === 'TAGALOG' ? 'tl-PH' : 'en-US';

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    let voice;
    if (lang === 'TAGALOG') {
      voice = voices.find(v => v.lang.toLowerCase().includes('fil') || v.lang.toLowerCase().includes('tl'));
    } else {
      voice = voices.find(v => v.lang.toLowerCase().includes('en'));
    }
    if (voice) {
      utterance.voice = voice;
    }
  }

  window.speechSynthesis.speak(utterance);
};

export default function App() {
  const [screen, setScreen] = useState('HOME');
  const [unlockedLevels, setUnlockedLevels] = useState([1]);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  
  const audioRef = useRef(null);
  const audioCache = useRef({});

  const [settings, setSettings] = useState({
    music: 70,
    sfx: 80,
    voice: 90,
    lang: 'ENGLISH'
  });

  const getLevelData = () => {
    const level = mockLevels.find((l) => l.id === currentLevel) || mockLevels[0];
    return {
      ...level[settings.lang],
      correct: level.correct
    };
  };

  const t = (key) => uiText[settings.lang][key];

  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  useEffect(() => {
    if (screen === 'IN_GAME') {
      setSelectedAnswer(null);
      setFeedbackMsg('');
      setIsPaused(false);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    }
  }, [screen, currentLevel]);

  const navTo = (newScreen) => {
    playSound('click', settings.sfx);
    setScreen(newScreen);
  };

  const playCurrentClue = async () => {
    if (isAudioLoading || settings.voice <= 0) return;
    playSound('click', settings.sfx);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const data = getLevelData();
    const characterName = data.character || 'Detective';
    const textToSpeak = `${data.clue} ... ${data.question}`;
    const cacheKey = `${currentLevel}-${settings.lang}`;

    if (audioCache.current[cacheKey]) {
      const audio = new Audio(audioCache.current[cacheKey]);
      audio.volume = settings.voice / 100;
      audioRef.current = audio;
      audio.play();
      return;
    }

    setIsAudioLoading(true);

    try {
      const promptText = settings.lang === 'TAGALOG' 
        ? `You are voice acting as ${characterName}. Read this text in fluent native Tagalog with proper emotion, intonations, and character voice. Make sure your pronunciation is completely accurate for a native Filipino Tagalog speaker, avoiding any English accent: "${textToSpeak}"` 
        : `You are voice acting as ${characterName}. Speak this text naturally and cheerfully, conveying the character's persona: "${textToSpeak}"`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Aoede" 
                }
              }
            }
          },
          model: "gemini-2.5-flash-preview-tts"
        })
      });

      if (!response.ok) throw new Error("TTS API Error");

      const result = await response.json();
      const inlineData = result.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      
      if (inlineData && inlineData.data) {
        const binaryString = atob(inlineData.data);
        const pcmData = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          pcmData[i] = binaryString.charCodeAt(i);
        }

        let sampleRate = 24000; 
        if (inlineData.mimeType) {
          const match = inlineData.mimeType.match(/rate=(\d+)/);
          if (match) sampleRate = parseInt(match[1], 10);
        }

        const wavData = pcmToWav(pcmData, sampleRate);
        const blob = new Blob([wavData], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        
        audioCache.current[cacheKey] = url;

        const audio = new Audio(url);
        audio.volume = settings.voice / 100;
        audioRef.current = audio;
        audio.play();
      } else {
        fallbackSpeech(textToSpeak, settings.voice, settings.lang);
      }
    } catch (error) {
      console.error("TTS API Error falling back to browser synthesis:", error);
      fallbackSpeech(textToSpeak, settings.voice, settings.lang);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handlePause = () => {
    playSound('click', settings.sfx);
    if (audioRef.current) {
      audioRef.current.pause();
    } else if (window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
    setIsPaused(true);
  };

  const handleResume = () => {
    playSound('click', settings.sfx);
    if (audioRef.current) {
      audioRef.current.play();
    } else if (window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
    setIsPaused(false);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) {
      setFeedbackMsg(t('feedbackNoAns'));
      return;
    }

    const data = getLevelData();
    if (selectedAnswer === data.correct) {
      playSound('success', settings.sfx);
      if (!completedLevels.includes(currentLevel)) {
        setCompletedLevels([...completedLevels, currentLevel]);
      }
      if (currentLevel < 10 && !unlockedLevels.includes(currentLevel + 1)) {
        setUnlockedLevels([...unlockedLevels, currentLevel + 1]);
      }
      setScreen('LEVEL_COMPLETE');
    } else {
      playSound('error', settings.sfx);
      setFeedbackMsg(t('feedbackWrong'));
    }
  };

  const renderScreen = () => {
    switch (screen) {
      case 'HOME':
        return (
          <div className="flex flex-col h-full w-full items-center justify-between bg-[#5ce1e6] relative overflow-hidden">
            <div className="absolute top-10 left-10 w-24 h-12 bg-white/40 rounded-full blur-md"></div>
            <div className="absolute top-24 right-8 w-32 h-16 bg-white/40 rounded-full blur-md"></div>

            <svg viewBox="0 0 400 300" className="absolute bottom-[28%] w-full h-[45%] z-0" preserveAspectRatio="xMidYMax meet">
               <rect x="20" y="150" width="100" height="150" fill="#ffb86c" />
               <polygon points="10,150 120,150 70,110" fill="#e65100" />
               <rect x="40" y="180" width="25" height="45" rx="12.5" fill="#a4cafe" stroke="#ffffff" strokeWidth="4" />
               <rect x="75" y="180" width="25" height="45" rx="12.5" fill="#a4cafe" stroke="#ffffff" strokeWidth="4" />
               <rect x="40" y="240" width="25" height="45" rx="12.5" fill="#a4cafe" stroke="#ffffff" strokeWidth="4" />
               <rect x="75" y="240" width="25" height="45" rx="12.5" fill="#a4cafe" stroke="#ffffff" strokeWidth="4" />

               <rect x="280" y="150" width="100" height="150" fill="#ffb86c" />
               <polygon points="280,150 390,150 330,110" fill="#e65100" />
               <rect x="300" y="180" width="25" height="45" rx="12.5" fill="#a4cafe" stroke="#ffffff" strokeWidth="4" />
               <rect x="335" y="180" width="25" height="45" rx="12.5" fill="#a4cafe" stroke="#ffffff" strokeWidth="4" />
               <rect x="300" y="240" width="25" height="45" rx="12.5" fill="#a4cafe" stroke="#ffffff" strokeWidth="4" />
               <rect x="335" y="240" width="25" height="45" rx="12.5" fill="#a4cafe" stroke="#ffffff" strokeWidth="4" />

               <rect x="110" y="100" width="180" height="200" fill="#ffb86c" />
               <polygon points="90,100 200,30 310,100" fill="#e65100" />
               
               <circle cx="200" cy="80" r="18" fill="#a4cafe" stroke="#ffffff" strokeWidth="4" />
               <line x1="200" y1="62" x2="200" y2="98" stroke="#ffffff" strokeWidth="4" />
               <line x1="182" y1="80" x2="218" y2="80" stroke="#ffffff" strokeWidth="4" />
               
               <rect x="140" y="130" width="30" height="50" rx="15" fill="#a4cafe" stroke="#ffffff" strokeWidth="4" />
               <rect x="230" y="130" width="30" height="50" rx="15" fill="#a4cafe" stroke="#ffffff" strokeWidth="4" />
               <rect x="140" y="200" width="30" height="50" rx="15" fill="#a4cafe" stroke="#ffffff" strokeWidth="4" />
               <rect x="230" y="200" width="30" height="50" rx="15" fill="#a4cafe" stroke="#ffffff" strokeWidth="4" />
            </svg>

            <div className="absolute bottom-0 w-full h-[32%] bg-[#9ccc65] z-0 flex justify-center overflow-hidden border-t-4 border-[#7cb342]">
                <div className="absolute bottom-4 left-6 w-3 h-3 bg-white rounded-full opacity-60"></div>
                <div className="absolute bottom-12 right-10 w-2 h-2 bg-yellow-300 rounded-full"></div>
                <div className="absolute top-4 left-20 w-2 h-2 bg-white rounded-full opacity-80"></div>
                <div className="absolute top-10 right-20 w-3 h-3 bg-white rounded-full opacity-50"></div>

               <div className="h-full w-[80%] bg-[#b0bec5] border-x-4 border-[#90a4ae]"
                    style={{ clipPath: 'polygon(30% 0, 70% 0, 100% 100%, 0% 100%)' }}>
                  <svg className="w-full h-full opacity-30" preserveAspectRatio="none">
                    <path d="M 30% 20% L 70% 20% M 20% 40% L 80% 40% M 10% 60% L 90% 60% M 0% 80% L 100% 80%" stroke="#546e7a" strokeWidth="4" fill="none" />
                    <path d="M 50% 0% L 50% 100% M 40% 20% L 30% 100% M 60% 20% L 70% 100%" stroke="#546e7a" strokeWidth="3" fill="none" />
                  </svg>
               </div>
            </div>

            <div className="mt-12 z-20 flex flex-col items-center drop-shadow-[0_6px_0_rgba(0,0,0,0.3)]">
              <h1 className="text-[3.5rem] leading-[1.1] font-black text-[#ffca28] text-center uppercase relative" style={{ WebkitTextStroke: '4px #3e2723' }}>
                <span className="relative inline-block tracking-widest">
                  {t('title1')}
                  <svg className="absolute -top-12 -right-8 w-20 h-20 text-[#212121] rotate-[15deg] drop-shadow-md" viewBox="0 0 64 64">
                    <path d="M20 34 C20 14 44 14 44 34 Z" fill="#1a1a1a" />
                    <ellipse cx="32" cy="36" rx="26" ry="6" fill="#1a1a1a" />
                    <path d="M20 32 Q 32 37 44 32 L44 30 Q 32 35 20 30 Z" fill="#e0e0e0" />
                  </svg>
                </span>
                <br />
                <span className="tracking-wide text-[2.8rem]">{t('title2')}</span>
              </h1>
            </div>

            <button
              onClick={() => navTo('LEVEL_SELECT')}
              className="relative z-30 active:scale-95 transition-transform mt-8"
            >
               <div className="absolute top-[80%] left-[75%] w-10 h-36 bg-[#37474f] rounded-full origin-top-left -rotate-45 shadow-lg border-[3px] border-[#263238]"></div>
               <div className="absolute top-[75%] left-[70%] w-10 h-10 bg-[#78909c] rounded-full z-10 border-[3px] border-[#546e7a]"></div>
               
               <div className="relative w-64 h-64 rounded-full border-[18px] border-[#607d8b] bg-[#e1f5fe] flex items-center justify-center shadow-2xl overflow-hidden ring-4 ring-[#455a64] inset-shadow-inner">
                   <div className="absolute top-2 left-4 w-40 h-40 bg-white/50 rounded-full blur-md"></div>
                   <div className="absolute top-6 left-8 w-28 h-12 bg-white/70 rounded-full rotate-[-30deg] blur-[2px]"></div>
                   
                   <div className="w-0 h-0 border-y-[35px] border-y-transparent border-l-[55px] border-l-white ml-6 drop-shadow-md z-10 relative"></div>
                   <div className="absolute inset-0 bg-blue-400/10 rounded-full"></div>
               </div>
            </button>

            <div className="flex gap-4 w-full px-8 pb-8 z-20">
              <button
                onClick={() => navTo('INSTRUCTIONS')}
                className="flex-1 bg-[#ffca28] border-[4px] border-[#d84315] text-[#3e2723] rounded-full py-3 flex justify-center items-center gap-2 font-black active:scale-95 shadow-[0_4px_0_#d84315]"
              >
                <BookOpen className="w-5 h-5" /> <span className="text-sm">{t('instructions')}</span>
              </button>
              <button
                onClick={() => navTo('SETTINGS')}
                className="flex-1 bg-[#ffca28] border-[4px] border-[#d84315] text-[#3e2723] rounded-full py-3 flex justify-center items-center gap-2 font-black active:scale-95 shadow-[0_4px_0_#d84315]"
              >
                <SettingsIcon className="w-5 h-5" /> <span className="text-sm">{t('settings')}</span>
              </button>
            </div>
          </div>
        );

      case 'SETTINGS':
        return (
          <div className="flex flex-col h-full w-full bg-[#e0f7fa] relative font-black text-[#3e2723]">
            <div className="flex-1 overflow-y-auto px-6 pb-24">
              <div className="mt-8 flex flex-col items-center">
                <h2 className="text-xl text-center uppercase flex flex-col items-center tracking-widest text-[#00838f]">
                  <span>{t('title1')}<br/>{t('title2')}</span>
                </h2>
                <h1 className="text-[2.5rem] mt-2 drop-shadow-sm text-[#3e2723] uppercase">{t('settings')}</h1>
              </div>

              <div className="mt-8 space-y-6">
                <div className="bg-white border-[4px] border-[#00838f] rounded-[2rem] p-6 shadow-sm">
                  <h3 className="text-xl mb-6 text-[#00838f] uppercase">{t('volume')}</h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Music className="w-8 h-8 text-[#ff8f00]" />
                      <div className="flex-1 flex flex-col">
                        <span className="text-[10px] text-[#78909c] uppercase tracking-wider mb-1">{t('bgm')}</span>
                        <input
                          type="range"
                          value={settings.music}
                          onChange={(e) => setSettings({ ...settings, music: e.target.value })}
                          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ff8f00]"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Volume2 className="w-8 h-8 text-[#1976d2]" />
                      <div className="flex-1 flex flex-col">
                        <span className="text-[10px] text-[#78909c] uppercase tracking-wider mb-1">{t('sfx')}</span>
                        <input
                          type="range"
                          value={settings.sfx}
                          onChange={(e) => setSettings({ ...settings, sfx: e.target.value })}
                          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1976d2]"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Mic className="w-8 h-8 text-[#388e3c]" />
                      <div className="flex-1 flex flex-col">
                        <span className="text-[10px] text-[#78909c] uppercase tracking-wider mb-1">{t('voice')}</span>
                        <input
                          type="range"
                          value={settings.voice}
                          onChange={(e) => setSettings({ ...settings, voice: e.target.value })}
                          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#388e3c]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-[4px] border-[#00838f] rounded-[2rem] p-6 shadow-sm">
                  <h3 className="text-xl mb-6 text-[#00838f] uppercase">{t('language')}</h3>
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => setSettings({...settings, lang: 'ENGLISH'})}
                      className={`border-[3px] px-6 py-3 rounded-full text-sm flex items-center gap-3 active:scale-95 w-fit
                        ${settings.lang === 'ENGLISH' ? 'border-[#00838f] text-[#3e2723]' : 'border-gray-300 text-gray-500'}`}
                    >
                      <div className={`w-5 h-5 rounded-full border-[3px] flex items-center justify-center
                        ${settings.lang === 'ENGLISH' ? 'border-[#00838f]' : 'border-gray-300'}`}>
                        {settings.lang === 'ENGLISH' && <div className="w-2.5 h-2.5 bg-[#1976d2] rounded-full"></div>}
                      </div>
                      ENGLISH
                    </button>

                    <button
                      onClick={() => setSettings({...settings, lang: 'TAGALOG'})}
                      className={`border-[3px] px-6 py-3 rounded-full text-sm flex items-center gap-3 active:scale-95 w-fit
                        ${settings.lang === 'TAGALOG' ? 'border-[#00838f] text-[#3e2723]' : 'border-gray-300 text-gray-500'}`}
                    >
                      <div className={`w-5 h-5 rounded-full border-[3px] flex items-center justify-center
                        ${settings.lang === 'TAGALOG' ? 'border-[#00838f]' : 'border-gray-300'}`}>
                        {settings.lang === 'TAGALOG' && <div className="w-2.5 h-2.5 bg-[#f48fb1] rounded-full"></div>}
                      </div>
                      TAGALOG
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10 pointer-events-none">
              <button
                onClick={() => navTo('HOME')}
                className="w-[4.5rem] h-[4.5rem] bg-[#ffca28] border-[4px] border-[#e65100] rounded-full flex items-center justify-center active:scale-95 shadow-[0_4px_0_#e65100] text-[#e65100] pointer-events-auto"
              >
                <ArrowLeft className="w-10 h-10" strokeWidth={3} />
              </button>
            </div>
          </div>
        );

      case 'INSTRUCTIONS':
        return (
          <div className="flex flex-col h-full w-full bg-[#fff3e0] relative p-6 font-black text-[#3e2723]">
             <div className="mt-8 flex flex-col items-center">
              <h2 className="text-xl text-center uppercase flex flex-col items-center tracking-widest text-[#e65100]">
                <span>{t('title1')}<br/>{t('title2')}</span>
              </h2>
              <h1 className="text-3xl mt-4 drop-shadow-sm uppercase text-center">{t('howToPlay')}</h1>
            </div>

            <div className="flex-1 mt-8 space-y-4">
               <div className="bg-white border-[4px] border-[#ffb300] p-4 rounded-2xl flex items-center gap-4 shadow-[0_4px_0_#ffb300]">
                  <PlayCircle className="w-12 h-12 text-[#1976d2] shrink-0" />
                  <p className="text-sm leading-snug">{t('inst1')}</p>
               </div>
               <div className="bg-white border-[4px] border-[#ffb300] p-4 rounded-2xl flex items-center gap-4 shadow-[0_4px_0_#ffb300]">
                  <BookOpen className="w-12 h-12 text-[#388e3c] shrink-0" />
                  <p className="text-sm leading-snug">{t('inst2')}</p>
               </div>
               <div className="bg-white border-[4px] border-[#ffb300] p-4 rounded-2xl flex items-center gap-4 shadow-[0_4px_0_#ffb300]">
                  <CheckCircle2 className="w-12 h-12 text-[#d32f2f] shrink-0" />
                  <p className="text-sm leading-snug">{t('inst3')}</p>
               </div>
               <div className="bg-white border-[4px] border-[#ffb300] p-4 rounded-2xl flex items-center gap-4 shadow-[0_4px_0_#ffb300]">
                  <Puzzle className="w-12 h-12 text-[#7b1fa2] shrink-0" />
                  <p className="text-sm leading-snug">{t('inst4')}</p>
               </div>
            </div>

             <div className="flex justify-center pb-8">
              <button
                onClick={() => navTo('HOME')}
                className="w-16 h-16 bg-[#29b6f6] border-[4px] border-[#0277bd] rounded-full flex items-center justify-center active:scale-95 shadow-[0_4px_0_#0277bd] text-white"
              >
                <ArrowLeft className="w-8 h-8" strokeWidth={3} />
              </button>
            </div>
          </div>
        );

      case 'LEVEL_SELECT':
        return (
          <div className="flex flex-col h-full w-full bg-[#f3e5f5] p-6 font-black text-[#3e2723]">
            <div className="mt-4 flex flex-col items-center">
              <h2 className="text-lg text-center uppercase mb-2 text-[#7b1fa2] tracking-wider">{t('title1')} {t('title2')}</h2>
              <h1 className="text-[1.7rem] text-[#4a148c] drop-shadow-sm text-center">{t('lvlSelect')}</h1>
              <div className="flex gap-2 mt-3">
                <Star className="w-6 h-6 fill-[#ffca28] text-[#ffca28]" />
                <Star className="w-8 h-8 fill-[#ffca28] text-[#ffca28]" />
                <Star className="w-6 h-6 fill-[#ffca28] text-[#ffca28]" />
              </div>
            </div>

            <div className="flex-1 mt-8">
              <div className="grid grid-cols-3 gap-4">
                {[...Array(10)].map((_, idx) => {
                  const lvl = idx + 1;
                  const isUnlocked = unlockedLevels.includes(lvl);
                  const isCompleted = completedLevels.includes(lvl);
                  const isActive = currentLevel === lvl;

                  let boxClass = "border-[4px] rounded-2xl flex flex-col items-center justify-center h-24 transition-transform active:scale-95 shadow-[0_4px_0_rgba(0,0,0,0.2)] ";
                  if (!isUnlocked) {
                    boxClass += "bg-gray-300 border-gray-400 text-gray-500 shadow-[0_4px_0_#9ca3af]";
                  } else if (isCompleted) {
                    boxClass += "bg-[#a5d6a7] border-[#2e7d32] text-[#1b5e20] shadow-[0_4px_0_#2e7d32]";
                  } else if (isActive) {
                    boxClass += "bg-[#81d4fa] border-[#0277bd] text-[#01579b] shadow-[0_4px_0_#0277bd] scale-105";
                  } else {
                    boxClass += "bg-white border-[#7b1fa2] text-[#4a148c] shadow-[0_4px_0_#7b1fa2]";
                  }

                  return (
                    <div key={lvl} className={lvl === 10 ? "col-span-3 flex justify-center" : ""}>
                      <button
                        onClick={() => {
                          if (isUnlocked) {
                            playSound('click', settings.sfx);
                            setCurrentLevel(lvl);
                            setScreen('IN_GAME');
                          }
                        }}
                        disabled={!isUnlocked}
                        className={lvl === 10 ? `${boxClass} w-[45%]` : `${boxClass} w-full`}
                      >
                        <span className="text-[11px] mb-1 leading-tight">{t('lvlPrefix')}<br/>{lvl}</span>
                        {isUnlocked ? (
                          <div className="flex gap-0.5">
                            <Star className={`w-3 h-3 ${isCompleted ? 'fill-[#ffca28] text-[#f57f17]' : 'fill-white text-gray-300'}`} />
                            <Star className={`w-3 h-3 ${isCompleted ? 'fill-[#ffca28] text-[#f57f17]' : 'fill-white text-gray-300'}`} />
                            <Star className={`w-3 h-3 ${isCompleted ? 'fill-[#ffca28] text-[#f57f17]' : 'fill-white text-gray-300'}`} />
                          </div>
                        ) : (
                          <Lock className="w-4 h-4 mt-1 opacity-50" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center pb-8">
              <button
                onClick={() => navTo('HOME')}
                className="w-16 h-16 bg-[#ffca28] border-[4px] border-[#d84315] rounded-full flex flex-col items-center justify-center active:scale-95 shadow-[0_4px_0_#d84315] text-[#d84315]"
              >
                <div className="flex flex-col items-center">
                  <ArrowLeft className="w-6 h-6 -mb-1" strokeWidth={3} />
                  <span className="text-[10px]">{t('back')}</span>
                </div>
              </button>
            </div>
          </div>
        );

      case 'IN_GAME':
        const levelData = getLevelData();
        return (
          <div className="flex flex-col h-full w-full bg-[#f1f8e9] font-black text-[#1b5e20] p-4 pt-8 relative">
            <div className="flex justify-between items-center border-b-[3px] border-[#4caf50] pb-4">
              <div className="flex gap-2">
                <button onClick={() => navTo('HOME')} className="bg-white border-[3px] border-[#4caf50] rounded-full p-2 active:scale-95 shadow-sm">
                  <Home className="w-5 h-5 text-[#2e7d32]" />
                </button>
                <button onClick={playCurrentClue} disabled={isAudioLoading} className="bg-white border-[3px] border-[#4caf50] rounded-full p-2 active:scale-95 shadow-sm disabled:opacity-50">
                  <RotateCcw className="w-5 h-5 text-[#2e7d32]" />
                </button>
                <button onClick={handlePause} className="bg-white border-[3px] border-[#4caf50] rounded-full p-2 active:scale-95 shadow-sm">
                  <Pause className="w-5 h-5 fill-[#2e7d32] text-[#2e7d32]" />
                </button>
              </div>
              <div className="text-center leading-tight text-[#2e7d32] mt-1">
                <span className="text-[10px]">{t('title1')}</span><br/>
                <span className="text-[10px]">{t('title2')}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] bg-[#c8e6c9] px-3 py-1.5 rounded-full border-[3px] border-[#4caf50] uppercase">
                <Search className="w-3 h-3" strokeWidth={3} />
                {currentLevel}/10
              </div>
            </div>

            <div className="flex items-center gap-2 py-3 border-b-[3px] border-[#4caf50] text-[#2e7d32]">
              <Puzzle className="w-6 h-6 fill-[#ff9800] text-[#f57f17]" />
              <span className="text-[11px] uppercase">{t('puzzleProg')}: {completedLevels.length}/10</span>
            </div>

            <div className="flex-1 mt-5 flex flex-col relative z-0">
              <div className="bg-white border-[4px] border-[#81c784] rounded-3xl p-4 relative shadow-[0_0_0_3px_#4caf50] max-h-48 overflow-y-auto shrink-0 flex flex-col custom-scrollbar">
                <div className="flex items-center gap-3 mb-3 text-[#2e7d32] shrink-0">
                  <div className="bg-white border-[3px] border-[#ffca28] p-1.5 rounded-full shadow-sm">
                     <User className="w-5 h-5 text-[#ffb300]" />
                  </div>
                  <span className="text-[12px] tracking-wide uppercase">{levelData.character}</span>
                </div>
                <p className="text-[13px] leading-relaxed text-[#000000] shrink-0 pb-1">
                  "{levelData.clue}"
                </p>
              </div>

              <div className="flex justify-center my-4 shrink-0">
                <button
                  onClick={playCurrentClue}
                  disabled={isAudioLoading}
                  className={`flex items-center gap-2 text-xs active:scale-95 bg-[#03a9f4] border-[4px] border-transparent rounded-full px-6 py-3 text-white shadow-[0_4px_0_#0288d1] ${isAudioLoading ? 'opacity-70' : ''}`}
                >
                  <Volume2 className="w-5 h-5" />
                  <PlayCircle className="w-5 h-5 fill-white text-[#03a9f4]" />
                  <span>{isAudioLoading ? t('loading') : t('playAudio')}</span>
                </button>
              </div>

              <p className="text-center text-[14px] mb-4 px-2 text-[#1b5e20] leading-snug font-bold">
                {levelData.question}
              </p>

              <div className="space-y-4 px-4 flex-1">
                {levelData.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      playSound('click', settings.sfx);
                      setSelectedAnswer(idx);
                      setFeedbackMsg('');
                    }}
                    className={`w-full py-3.5 rounded-full text-xs transition-all border-[3px] shadow-[0_4px_0_#e0e0e0]
                      ${selectedAnswer === idx ? 'bg-[#ffca28] border-[#f57f17] text-[#e65100] shadow-[0_4px_0_#f57f17] scale-105' : 'bg-white border-transparent text-[#263238] hover:bg-gray-50'}`}
                  >
                    {choice}
                  </button>
                ))}
              </div>

              <div className="mt-4 bg-[#c8e6c9] rounded-[2rem] p-3 flex gap-3 items-center mb-4">
                <button
                  onClick={handleCheckAnswer}
                  className="flex flex-col items-center justify-center bg-[#ff7043] border-[3px] border-[#ff7043] text-white rounded-2xl p-2 px-4 active:scale-95 shadow-[0_4px_0_#d84315] shrink-0"
                >
                  <div className="flex flex-col items-center gap-1">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-[9px] uppercase text-center leading-tight whitespace-pre-wrap">{t('checkAns')}</span>
                  </div>
                </button>
                <div className="flex-1 bg-white border-[3px] border-[#81c784] border-dashed rounded-2xl h-full min-h-[60px] flex items-center justify-center p-2 text-center text-xs relative overflow-hidden">
                  <Puzzle className="absolute opacity-[0.08] w-20 h-20 text-[#2e7d32]" />
                  {feedbackMsg ? (
                    <span className={`z-10 text-[11px] leading-tight ${feedbackMsg === t('feedbackWrong') || feedbackMsg === t('feedbackNoAns') ? 'text-[#d32f2f]' : 'text-[#2e7d32]'}`}>
                      {feedbackMsg}
                    </span>
                  ) : (
                    <span className="text-gray-400 z-10 italic text-[11px] leading-tight">{t('feedbackWait')}</span>
                  )}
                </div>
              </div>
            </div>

            {isPaused && (
              <div className="absolute inset-0 bg-gray-900/60 z-50 flex items-center justify-center rounded-[28px]">
                <div className="bg-white p-8 rounded-3xl border-[6px] border-[#4caf50] flex flex-col items-center shadow-2xl">
                  <h2 className="text-3xl font-black text-[#2e7d32] mb-8 tracking-widest">{t('paused')}</h2>
                  <button
                    onClick={handleResume}
                    className="bg-[#ffca28] border-[4px] border-[#f57f17] text-[#e65100] px-8 py-3 rounded-full font-black text-xl shadow-[0_4px_0_#f57f17] active:translate-y-[4px] active:shadow-none transition-all uppercase"
                  >
                    {t('resume')}
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'LEVEL_COMPLETE':
        return (
          <div className="flex flex-col h-full w-full bg-gradient-to-b from-[#ffca28] to-[#ff9800] font-black text-[#3e2723] p-4 pt-10 relative overflow-hidden">
            <div className="absolute top-10 left-4 opacity-20"><Star className="w-16 h-16 fill-white"/></div>
            <div className="absolute bottom-20 right-4 opacity-20"><Star className="w-24 h-24 fill-white"/></div>

            <div className="mt-6 flex flex-col items-center mb-8 relative z-10 drop-shadow-md">
              <h2 className="text-3xl text-center uppercase flex flex-col items-center text-white" style={{ WebkitTextStroke: '2px #e65100' }}>
                <span>{t('title1')}<br/>{t('title2')}</span>
              </h2>
            </div>

            <div className="border-[6px] border-[#e65100] rounded-3xl relative bg-white mx-2 shadow-[0_12px_0_0_#d84315] z-10 flex flex-col">
              <div className="bg-[#ffe082] border-b-[6px] border-[#e65100] p-4 flex justify-between items-center rounded-t-2xl">
                 <span className="text-lg pl-2 text-[#d84315] uppercase">{t('caseComplete')}</span>
                 <button onClick={() => navTo('LEVEL_SELECT')} className="active:scale-95 bg-white border-[3px] border-[#e65100] rounded-full p-1 shadow-sm">
                   <X className="w-6 h-6 text-[#d84315]" strokeWidth={3} />
                 </button>
              </div>
              
              <div className="p-6 flex flex-col items-center flex-1">
                <div className="flex gap-2 mb-2 items-end">
                  <Star className="w-8 h-8 fill-[#ffca28] text-[#f57f17] drop-shadow-sm mb-1" />
                  <Star className="w-12 h-12 fill-[#ffca28] text-[#f57f17] drop-shadow-md" />
                  <Star className="w-8 h-8 fill-[#ffca28] text-[#f57f17] drop-shadow-sm mb-1" />
                </div>
                <p className="text-[15px] mb-6 text-gray-700">{t('greatJob')}</p>

                <div className="flex flex-col items-center w-full">
                  <div className="text-sm font-bold text-[#e65100] mb-3 uppercase tracking-wide bg-[#ffe082] px-4 py-1.5 rounded-full border-[3px] border-[#ffb300] shadow-sm flex items-center gap-2">
                    <Puzzle className="w-4 h-4" />
                    {completedLevels.length < 10 ? `Trophy Pieces: ${completedLevels.length}/10` : 'Trophy Complete!'}
                  </div>
                  <div className="w-48 h-32 border-[6px] border-[#90caf9] rounded-2xl mb-8 flex items-center justify-center bg-[#e3f2fd] relative overflow-hidden shadow-inner">
                     <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #2196f3 2px, transparent 2px)', backgroundSize: '16px 16px' }}></div>
                     
                     <div className="relative w-24 h-24 z-10 flex items-center justify-center">
                       {/* Empty silhouette representing missing pieces */}
                       <Trophy className="w-24 h-24 text-[#b0bec5] absolute opacity-50" />
                       
                       {/* The pieced-together trophy */}
                       <div 
                         className="absolute top-0 left-0 w-24 h-24 overflow-hidden transition-all duration-1000"
                         style={{ clipPath: `inset(${100 - (completedLevels.length * 10)}% 0 0 0)` }}
                       >
                         <Trophy className="w-24 h-24 fill-[#ffca28] text-[#f57f17] drop-shadow-md absolute top-0 left-0" />
                       </div>
                     </div>
                  </div>
                </div>

                <div className="flex justify-between w-full gap-3 mt-auto">
                  <button
                    onClick={() => {
                      if (currentLevel < 10) {
                        setCurrentLevel(currentLevel + 1);
                        setScreen('IN_GAME');
                      } else {
                        setScreen('LEVEL_SELECT');
                      }
                    }}
                    className="flex-1 bg-[#4caf50] border-[4px] border-[#2e7d32] rounded-2xl px-2 py-3 text-[10px] active:scale-95 text-center leading-tight shadow-[0_4px_0_#2e7d32] text-white"
                  >
                    {t('playNext1')}<br/>{t('playNext2')}
                  </button>
                  <button
                    onClick={() => navTo('IN_GAME')}
                    className="flex-1 bg-[#29b6f6] border-[4px] border-[#0277bd] rounded-2xl px-2 py-3 text-[10px] active:scale-95 text-center flex items-center justify-center shadow-[0_4px_0_#0277bd] text-white"
                  >
                    {t('playAgain')}
                  </button>
                  <button
                    onClick={() => navTo('HOME')}
                    className="bg-white border-[4px] border-gray-300 rounded-2xl w-14 flex items-center justify-center active:scale-95 shrink-0 shadow-[0_4px_0_#9ca3af] text-gray-600"
                  >
                    <Home className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans selection:bg-none">
      <div className="w-[360px] h-[800px] bg-white rounded-[40px] shadow-2xl overflow-hidden relative border-[12px] border-black flex flex-col ring-8 ring-gray-800">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-3xl z-50"></div>
        {renderScreen()}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-black rounded-full z-50"></div>
      </div>
    </div>
  );
}