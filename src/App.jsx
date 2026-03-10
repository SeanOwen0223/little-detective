import React, { useState } from 'react';
import {
  Search,
  Play,
  Settings,
  HelpCircle,
  Volume2,
  Lock,
  Star,
  Check,
  Puzzle,
  VolumeX,
  Home,
  ArrowRight,
  RotateCcw,
  Menu,
  Map,
  Ear,
  BookOpen,
  User
} from 'lucide-react';

const mockLevels = [
  {
    id: 1,
    clue: 'The janitor saw something shiny near the art room...',
    question: 'Where might the missing trophy be?',
    choices: ['Library', 'Art Room', 'Gym'],
    correct: 1
  },
  {
    id: 2,
    clue: 'I left my favorite book where we eat lunch.',
    question: 'Where should we look?',
    choices: ['Cafeteria', 'Playground', 'Music Room'],
    correct: 0
  },
  {
    id: 3,
    clue: 'There are muddy footprints leading to the swings!',
    question: 'Follow the footprints to the...',
    choices: ['Classroom', 'Office', 'Playground'],
    correct: 2
  },
  {
    id: 4,
    clue: 'We heard a loud barking sound near the benches.',
    question: 'Where is the lost puppy?',
    choices: ['Library', 'Courtyard', 'Art Room'],
    correct: 1
  },
  {
    id: 5,
    clue: 'Someone left red and blue paint splatters on the floor.',
    question: 'Where did the missing paintbrush go?',
    choices: ['Art Room', 'Math Class', 'Gym'],
    correct: 0
  },
  {
    id: 6,
    clue: 'I hear a loud whistle and bouncing sounds!',
    question: 'Where is the missing basketball?',
    choices: ['Music Room', 'Gym', "Principal's Office"],
    correct: 1
  },
  {
    id: 7,
    clue: 'It smells like sweet, fresh cookies in here...',
    question: 'Where is the missing cookie jar?',
    choices: ['Nurse', 'Kitchen', 'Sandbox'],
    correct: 1
  },
  {
    id: 8,
    clue: 'There are so many tall shelves filled with stories.',
    question: 'Where did the teacher leave her glasses?',
    choices: ['Library', 'Gym', 'Bus Stop'],
    correct: 0
  },
  {
    id: 9,
    clue: 'Crash! Bang! Someone is practicing the drums.',
    question: 'Where are the missing drumsticks?',
    choices: ['Cafeteria', 'Music Room', 'Office'],
    correct: 1
  },
  {
    id: 10,
    clue: 'I see a blackboard and a desk with a shiny red apple.',
    question: 'Where is the golden star sticker?',
    choices: ['Playground', 'Gym', 'Classroom'],
    correct: 2
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

const speakText = (text, volume) => {
  if (volume <= 0 || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.volume = volume / 100;
  utterance.rate = 0.9;
  utterance.pitch = 1.2;
  window.speechSynthesis.speak(utterance);
};

export default function App() {
  const [screen, setScreen] = useState('HOME');
  const [unlockedLevels, setUnlockedLevels] = useState([1]);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showWrongAnswer, setShowWrongAnswer] = useState(false);
  const [settings, setSettings] = useState({
    music: 70,
    sfx: 80,
    voice: 90,
    narration: true,
    lang: 'English'
  });

  const getLevelData = () => {
    return mockLevels.find((l) => l.id === currentLevel) || mockLevels[0];
  };

  React.useEffect(() => {
    if (screen === 'IN_GAME' && settings.narration) {
      const data = getLevelData();
      speakText(`${data.clue} ... ${data.question}`, settings.voice);
    } else {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    }
  }, [screen, currentLevel, settings.narration, settings.voice]);

  const navTo = (newScreen) => {
    playSound('click', settings.sfx);
    setScreen(newScreen);
  };

  const handleAnswer = (index) => {
    const data = getLevelData();
    if (index === data.correct) {
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
      setShowWrongAnswer(true);
      setTimeout(() => setShowWrongAnswer(false), 2000);
    }
  };

  const renderScreen = () => {
    switch (screen) {
      case 'HOME':
        return (
          <div className="flex flex-col h-full w-full items-center justify-between p-6 bg-gradient-to-b from-sky-300 to-sky-100">
            <div className="mt-12 flex flex-col items-center">
              <div className="bg-yellow-400 p-4 rounded-3xl border-4 border-white shadow-lg transform -rotate-2">
                <h1 className="text-4xl font-black text-blue-900 tracking-wider text-center">
                  LITTLE
                  <br />
                  DETECTIVE
                </h1>
              </div>
              <p className="mt-4 text-xl font-bold text-sky-800 bg-white px-6 py-2 rounded-full shadow-md">
                Solve the Mystery!
              </p>
            </div>

            <button
              onClick={() => navTo('LEVEL_SELECT')}
              className="relative group w-48 h-48 rounded-full bg-blue-500 border-8 border-white shadow-2xl flex items-center justify-center transform transition-transform active:scale-95 hover:bg-blue-400"
            >
              <Search className="absolute w-40 h-40 text-blue-700 opacity-20 transform -rotate-12" />
              <Play
                className="w-24 h-24 text-white ml-4 drop-shadow-lg"
                fill="currentColor"
              />
              <div className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full opacity-40"></div>
            </button>

            <div className="flex w-full justify-between pb-4">
              <button
                onClick={() => navTo('INSTRUCTIONS')}
                className="w-20 h-20 bg-green-400 rounded-3xl border-4 border-white shadow-lg flex flex-col items-center justify-center active:scale-95 transition-transform"
              >
                <HelpCircle className="w-10 h-10 text-white mb-1" />
                <span className="text-xs font-bold text-white">How To</span>
              </button>
              <button
                onClick={() => navTo('SETTINGS')}
                className="w-20 h-20 bg-orange-400 rounded-3xl border-4 border-white shadow-lg flex flex-col items-center justify-center active:scale-95 transition-transform"
              >
                <Settings className="w-10 h-10 text-white mb-1" />
                <span className="text-xs font-bold text-white">Settings</span>
              </button>
            </div>
          </div>
        );

      case 'INSTRUCTIONS':
        return (
          <div className="flex flex-col h-full w-full p-6 bg-green-50">
            <h2 className="text-3xl font-black text-center text-green-700 mt-6 mb-8 bg-green-200 py-3 rounded-2xl shadow-sm border-2 border-green-300">
              How to Play
            </h2>

            <div className="flex-1 space-y-4">
              {[
                {
                  icon: <Ear className="w-8 h-8 text-white" />,
                  color: 'bg-blue-400',
                  text: 'Tap the Play Audio button to listen to the clue.'
                },
                {
                  icon: <BookOpen className="w-8 h-8 text-white" />,
                  color: 'bg-orange-400',
                  text: 'Read or listen to the question carefully.'
                },
                {
                  icon: (
                    <Check className="w-8 h-8 text-white" strokeWidth={4} />
                  ),
                  color: 'bg-green-400',
                  text: 'Choose the correct answer from three choices.'
                },
                {
                  icon: <Puzzle className="w-8 h-8 text-white" />,
                  color: 'bg-purple-400',
                  text: 'Collect puzzle pieces to solve the mystery!'
                }
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center bg-white p-4 rounded-2xl shadow-md border-2 border-gray-100"
                >
                  <div
                    className={`${step.color} p-3 rounded-full shadow-inner mr-4 shrink-0`}
                  >
                    {step.icon}
                  </div>
                  <p className="text-sm font-bold text-gray-700 leading-tight">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => navTo('HOME')}
              className="w-full py-4 mt-6 bg-yellow-400 text-blue-900 font-black text-xl rounded-full shadow-[0_6px_0_#b48600] active:shadow-[0_0px_0_#b48600] active:translate-y-[6px] transition-all"
            >
              GOT IT!
            </button>
          </div>
        );

      case 'SETTINGS':
        return (
          <div className="flex flex-col h-full w-full p-6 bg-purple-50">
            <h2 className="text-3xl font-black text-center text-purple-700 mt-6 mb-8 bg-purple-200 py-3 rounded-2xl shadow-sm border-2 border-purple-300">
              Settings
            </h2>

            <div className="flex-1 space-y-6">
              <div className="bg-white p-5 rounded-3xl shadow-md border-2 border-gray-100">
                {[
                  {
                    label: 'Music',
                    icon: Volume2,
                    key: 'music',
                    color: 'text-blue-500'
                  },
                  {
                    label: 'Sounds',
                    icon: Volume2,
                    key: 'sfx',
                    color: 'text-green-500'
                  },
                  {
                    label: 'Voice',
                    icon: User,
                    key: 'voice',
                    color: 'text-orange-500'
                  }
                ].map((item) => (
                  <div key={item.key} className="mb-6 last:mb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <item.icon className={`w-6 h-6 ${item.color}`} />
                        <span className="font-bold text-gray-700">
                          {item.label}
                        </span>
                      </div>
                      <span className="font-bold text-gray-400">
                        {settings[item.key]}%
                      </span>
                    </div>
                    <input
                      type="range"
                      value={settings[item.key]}
                      onChange={(e) =>
                        setSettings({ ...settings, [item.key]: e.target.value })
                      }
                      className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                ))}
              </div>

              <div className="bg-white p-5 rounded-3xl shadow-md border-2 border-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-700 text-lg">
                  Narration
                </span>
                <button
                  onClick={() => {
                    playSound('click', settings.sfx);
                    setSettings({
                      ...settings,
                      narration: !settings.narration
                    });
                  }}
                  className={`w-20 h-10 rounded-full flex items-center p-1 transition-colors ${settings.narration ? 'bg-green-400' : 'bg-gray-300'}`}
                >
                  <div
                    className={`w-8 h-8 bg-white rounded-full shadow-md transform transition-transform ${settings.narration ? 'translate-x-10' : 'translate-x-0'}`}
                  ></div>
                </button>
              </div>

              <div className="bg-white p-5 rounded-3xl shadow-md border-2 border-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-700 text-lg">
                  Language
                </span>
                <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-xl font-bold border-2 border-purple-200">
                  {settings.lang}
                </span>
              </div>
            </div>

            <button
              onClick={() => navTo('HOME')}
              className="w-full py-4 mt-6 bg-yellow-400 text-blue-900 font-black text-xl rounded-full shadow-[0_6px_0_#b48600] active:shadow-[0_0px_0_#b48600] active:translate-y-[6px] transition-all"
            >
              BACK
            </button>
          </div>
        );

      case 'LEVEL_SELECT':
        return (
          <div className="flex flex-col h-full w-full p-6 bg-orange-50 bg-[radial-gradient(#ffd8a8_2px,transparent_2px)] [background-size:20px_20px]">
            <div className="flex items-center justify-between mt-6 mb-8 shrink-0">
              <button
                onClick={() => navTo('HOME')}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md"
              >
                <Home className="w-6 h-6 text-orange-500" />
              </button>
              <h2 className="text-2xl font-black text-orange-800 bg-white px-6 py-2 rounded-2xl shadow-sm border-2 border-orange-200">
                Choose Level
              </h2>
              <div className="w-12"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 gap-y-6 mt-4 flex-1 content-start overflow-y-auto pb-12">
              {[...Array(10)].map((_, idx) => {
                const lvl = idx + 1;
                const isUnlocked = unlockedLevels.includes(lvl);
                const isCompleted = completedLevels.includes(lvl);

                return (
                  <button
                    key={lvl}
                    onClick={() => {
                      if (isUnlocked) {
                        playSound('click', settings.sfx);
                        setCurrentLevel(lvl);
                        setScreen('IN_GAME');
                      }
                    }}
                    disabled={!isUnlocked}
                    className={`relative w-full aspect-square rounded-3xl border-4 shadow-lg flex flex-col items-center justify-center transition-transform active:scale-95
                      ${
                        isCompleted
                          ? 'bg-green-400 border-green-200'
                          : isUnlocked
                            ? 'bg-sky-400 border-sky-200'
                            : 'bg-gray-300 border-gray-100 opacity-80'
                      }`}
                  >
                    {!isUnlocked ? (
                      <Lock className="w-10 h-10 text-gray-500" />
                    ) : (
                      <>
                        <span className="text-4xl font-black text-white drop-shadow-md">
                          {lvl}
                        </span>
                        {isCompleted && (
                          <div className="absolute -top-3 -right-3 bg-yellow-400 rounded-full p-1 border-2 border-white shadow-sm transform rotate-12">
                            <Star
                              className="w-6 h-6 text-yellow-800"
                              fill="currentColor"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'IN_GAME':
        const levelData = getLevelData();
        return (
          <div className="flex flex-col h-full w-full bg-blue-50 relative">
            <div className="p-4 flex justify-between items-center bg-white shadow-sm rounded-b-3xl z-10">
              <button
                onClick={() => navTo('LEVEL_SELECT')}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div className="bg-sky-100 px-4 py-1 rounded-full font-bold text-sky-800">
                Level {currentLevel}
              </div>
              <div className="w-10"></div>
            </div>

            <div className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto">
              <div className="bg-white rounded-3xl p-4 shadow-md border-2 border-sky-100 relative">
                <div className="absolute -top-4 -left-2 bg-yellow-400 w-12 h-12 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                  <User className="w-7 h-7 text-yellow-800" />
                </div>
                <p className="pl-10 text-lg font-bold text-gray-700 leading-snug">
                  "{levelData.clue}"
                </p>
              </div>

              <button
                onClick={() => {
                  playSound('click', settings.sfx);
                  speakText(
                    `${levelData.clue} ... ${levelData.question}`,
                    settings.voice
                  );
                }}
                className="self-center bg-green-400 hover:bg-green-500 text-white font-black text-lg py-3 px-8 rounded-full shadow-[0_4px_0_#15803d] active:shadow-[0_0px_0_#15803d] active:translate-y-[4px] flex items-center gap-2"
              >
                <Volume2 className="w-6 h-6" /> PLAY CLUE
              </button>

              <div className="bg-orange-100 rounded-3xl p-5 shadow-inner mt-2 border-2 border-orange-200">
                <p className="text-xl font-black text-orange-900 text-center leading-tight">
                  {levelData.question}
                </p>
              </div>

              <div className="space-y-3 mt-2">
                {levelData.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className="w-full bg-white border-2 border-gray-200 p-4 rounded-2xl shadow-sm text-xl font-bold text-gray-700 hover:bg-sky-50 active:scale-95 transition-all text-left flex items-center"
                  >
                    <span className="w-8 h-8 rounded-full bg-sky-200 text-sky-800 flex items-center justify-center mr-4 shrink-0 text-sm">
                      {['A', 'B', 'C'][idx]}
                    </span>
                    {choice}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] rounded-t-3xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Puzzle Progress
                </span>
                <span className="text-xs font-bold text-blue-500">
                  {completedLevels.length}/10
                </span>
              </div>
              <div className="flex justify-between gap-1">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-6 flex-1 rounded-sm border ${i < completedLevels.length ? 'bg-yellow-400 border-yellow-500' : 'bg-gray-100 border-gray-200'} flex items-center justify-center`}
                  >
                    {i < completedLevels.length && (
                      <Puzzle className="w-4 h-4 text-yellow-800 opacity-50" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {showWrongAnswer && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50 rounded-[32px]">
                <div className="bg-white p-6 rounded-3xl shadow-2xl transform scale-100 animate-bounce text-center border-4 border-red-400">
                  <h3 className="text-3xl font-black text-red-500 mb-2">
                    Oops!
                  </h3>
                  <p className="text-lg font-bold text-gray-600">
                    Try looking somewhere else.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 'LEVEL_COMPLETE':
        return (
          <div className="flex flex-col h-full w-full p-6 bg-gradient-to-b from-yellow-300 to-orange-400 items-center justify-center relative overflow-hidden">
            <div className="absolute top-10 left-10 text-white/30 animate-pulse">
              <Star className="w-16 h-16" fill="currentColor" />
            </div>
            <div className="absolute bottom-40 right-10 text-white/30 animate-pulse delay-100">
              <Star className="w-12 h-12" fill="currentColor" />
            </div>

            <h2 className="text-5xl font-black text-white text-center drop-shadow-lg mb-8 leading-tight transform -rotate-2">
              GREAT JOB,
              <br />
              DETECTIVE!
            </h2>

            <div className="bg-white w-48 h-48 rounded-full shadow-2xl flex items-center justify-center border-8 border-yellow-100 mb-10 relative">
              <div className="absolute -top-4 -right-4 bg-green-500 rounded-full p-2 border-4 border-white">
                <Check className="w-8 h-8 text-white" strokeWidth={4} />
              </div>
              <Puzzle className="w-24 h-24 text-sky-500 drop-shadow-md" />
            </div>

            <div className="w-full space-y-3">
              <button
                onClick={() => {
                  playSound('click', settings.sfx);
                  if (currentLevel < 10) {
                    setCurrentLevel(currentLevel + 1);
                    setScreen('IN_GAME');
                  } else {
                    setScreen('LEVEL_SELECT');
                  }
                }}
                className="w-full py-4 bg-green-500 text-white font-black text-xl rounded-full shadow-[0_6px_0_#15803d] active:shadow-[0_0px_0_#15803d] active:translate-y-[6px] transition-all flex justify-center items-center gap-2"
              >
                NEXT LEVEL <ArrowRight className="w-6 h-6" />
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navTo('IN_GAME')}
                  className="py-3 bg-sky-400 text-white font-bold rounded-2xl shadow-[0_4px_0_#0369a1] active:translate-y-[4px] active:shadow-none flex flex-col items-center justify-center"
                >
                  <RotateCcw className="w-5 h-5 mb-1" /> Replay
                </button>
                <button
                  onClick={() => navTo('LEVEL_SELECT')}
                  className="py-3 bg-purple-400 text-white font-bold rounded-2xl shadow-[0_4px_0_#6b21a8] active:translate-y-[4px] active:shadow-none flex flex-col items-center justify-center"
                >
                  <Map className="w-5 h-5 mb-1" /> Puzzle
                </button>
                <button
                  onClick={() => navTo('HOME')}
                  className="py-3 bg-white text-blue-900 font-bold rounded-2xl shadow-[0_4px_0_#cbd5e1] active:translate-y-[4px] active:shadow-none flex flex-col items-center justify-center"
                >
                  <Home className="w-5 h-5 mb-1" /> Home
                </button>
                <button
                  onClick={() => navTo('LEVEL_SELECT')}
                  className="py-3 bg-white text-orange-600 font-bold rounded-2xl shadow-[0_4px_0_#cbd5e1] active:translate-y-[4px] active:shadow-none flex flex-col items-center justify-center"
                >
                  <Menu className="w-5 h-5 mb-1" /> Exit
                </button>
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
      <div className="w-[360px] h-[800px] bg-white rounded-[40px] shadow-2xl overflow-hidden relative border-[12px] border-gray-800 flex flex-col ring-4 ring-gray-700">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-3xl z-50"></div>

        {renderScreen()}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-black/20 rounded-full z-50"></div>
      </div>
    </div>
  );
}
