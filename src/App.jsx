import React, { useState } from 'react';
import { Search, Play, Home, Lock, Star, Check, ArrowRight, HelpCircle, Settings } from 'lucide-react';

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
    correct: 1,
    comingSoon: true
  },
  {
    id: 7,
    clue: 'It smells like sweet, fresh cookies in here...',
    question: 'Where is the missing cookie jar?',
    choices: ['Nurse', 'Kitchen', 'Sandbox'],
    correct: 1,
    comingSoon: true
  },
  {
    id: 8,
    clue: 'There are so many tall shelves filled with stories.',
    question: 'Where did the teacher leave her glasses?',
    choices: ['Library', 'Gym', 'Bus Stop'],
    correct: 0,
    comingSoon: true
  },
  {
    id: 9,
    clue: 'Crash! Bang! Someone is practicing the drums.',
    question: 'Where are the missing drumsticks?',
    choices: ['Cafeteria', 'Music Room', 'Office'],
    correct: 1,
    comingSoon: true
  },
  {
    id: 10,
    clue: 'I see a blackboard and a desk with a shiny red apple.',
    question: 'Where is the golden star sticker?',
    choices: ['Playground', 'Gym', 'Classroom'],
    correct: 2,
    comingSoon: true
  }
];

export default function App() {
  const [screen, setScreen] = useState('HOME');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [unlockedLevels, setUnlockedLevels] = useState([1]);
  const [completedLevels, setCompletedLevels] = useState([]);

  const navTo = (newScreen) => {
    setScreen(newScreen);
  };

  const handleAnswer = (index) => {
    const data = mockLevels.find((l) => l.id === currentLevel);
    if (index === data.correct) {
      if (!completedLevels.includes(currentLevel)) {
        setCompletedLevels([...completedLevels, currentLevel]);
      }
      if (currentLevel < mockLevels.length && !unlockedLevels.includes(currentLevel + 1)) {
        setUnlockedLevels([...unlockedLevels, currentLevel + 1]);
      }
      setScreen('LEVEL_COMPLETE');
    } else {
      alert('Oops! Try looking somewhere else.');
    }
  };

  const renderScreen = () => {
    switch (screen) {
      case 'HOME':
        return (
          <div className="flex flex-col h-full w-full items-center justify-between p-6 bg-gradient-to-b from-sky-300 to-sky-100">
            <div className="mt-12 flex flex-col items-center">
              <div className="bg-yellow-400 p-4 rounded-3xl border-4 border-white shadow-lg transform -rotate-2 mb-12">
                <h1 className="text-4xl font-black text-blue-900 text-center">
                  LITTLE<br />DETECTIVE
                </h1>
              </div>
            </div>

            <button
              onClick={() => navTo('LEVEL_SELECT')}
              className="relative w-48 h-48 rounded-full bg-blue-500 border-8 border-white shadow-2xl flex items-center justify-center transform transition-transform active:scale-95"
            >
              <Search className="absolute w-40 h-40 text-blue-700 opacity-20 transform -rotate-12" />
              <Play className="w-24 h-24 ml-4 text-white drop-shadow-lg" fill="currentColor" />
            </button>

            <div className="flex w-full justify-between pb-4 px-2">
              <button
                disabled
                className="w-20 h-20 bg-gray-400 rounded-3xl border-4 border-white shadow-sm flex flex-col items-center justify-center opacity-60 cursor-not-allowed"
              >
                <HelpCircle className="w-10 h-10 text-white mb-1" />
                <span className="text-xs font-bold text-white">How To</span>
              </button>
              <button
                disabled
                className="w-20 h-20 bg-gray-400 rounded-3xl border-4 border-white shadow-sm flex flex-col items-center justify-center opacity-60 cursor-not-allowed"
              >
                <Settings className="w-10 h-10 text-white mb-1" />
                <span className="text-xs font-bold text-white">Settings</span>
              </button>
            </div>
          </div>
        );

      case 'LEVEL_SELECT':
        return (
          <div className="flex flex-col h-full w-full p-6 bg-orange-50">
            <div className="flex items-center mb-8 bg-white p-2 rounded-2xl shadow-sm border-2 border-orange-200">
              <button onClick={() => navTo('HOME')} className="p-2 bg-gray-100 rounded-full">
                <Home className="w-6 h-6 text-orange-500" />
              </button>
              <h2 className="text-2xl font-black ml-4 text-orange-800">Choose Level</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 overflow-y-auto pb-10">
              {mockLevels.map((lvl) => {
                const isComingSoon = lvl.comingSoon;
                const isUnlocked = !isComingSoon && unlockedLevels.includes(lvl.id);
                const isCompleted = !isComingSoon && completedLevels.includes(lvl.id);
                
                return (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      if (isUnlocked) {
                        setCurrentLevel(lvl.id);
                        navTo('IN_GAME');
                      }
                    }}
                    disabled={!isUnlocked || isComingSoon}
                    className={`aspect-square rounded-3xl border-4 flex flex-col items-center justify-center transition-transform active:scale-95 relative
                      ${isCompleted ? 'bg-green-400 border-green-200' : 
                        isUnlocked ? 'bg-sky-400 border-sky-200' : 'bg-gray-300 border-gray-100 opacity-80'}`}
                  >
                    {isComingSoon ? (
                      <>
                        <Lock className="w-8 h-8 text-gray-500 mb-1" />
                        <span className="text-sm font-black text-gray-500 tracking-wider">SOON</span>
                      </>
                    ) : !isUnlocked ? (
                      <Lock className="w-10 h-10 text-gray-500" />
                    ) : (
                      <>
                        <span className="text-4xl font-black text-white drop-shadow-md">{lvl.id}</span>
                        {isCompleted && (
                          <div className="absolute -top-3 -right-3 bg-yellow-400 rounded-full p-1 border-2 border-white">
                            <Star className="w-5 h-5 text-yellow-800" fill="currentColor" />
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
        const levelData = mockLevels.find((l) => l.id === currentLevel);
        return (
          <div className="flex flex-col h-full w-full bg-blue-50 relative">
            <div className="p-4 bg-white shadow-sm flex items-center justify-between z-10">
              <button onClick={() => navTo('LEVEL_SELECT')} className="text-blue-500 font-bold">Back</button>
              <div className="bg-sky-100 px-4 py-1 rounded-full font-bold text-sky-800">Level {currentLevel}</div>
              <div className="w-10"></div>
            </div>
            
            <div className="flex-1 p-6 flex flex-col gap-4">
              <div className="bg-white p-6 rounded-3xl shadow-md border-2 border-sky-100">
                <p className="text-lg font-bold text-gray-700 leading-snug">"{levelData.clue}"</p>
              </div>

              <div className="bg-orange-100 rounded-3xl p-5 shadow-inner mt-2 border-2 border-orange-200">
                <p className="text-xl font-black text-orange-900 text-center leading-tight">
                  {levelData.question}
                </p>
              </div>

              <div className="space-y-3 mt-4">
                {levelData.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className="w-full bg-white border-2 border-gray-200 p-4 rounded-2xl shadow-sm text-xl font-bold text-gray-700 hover:bg-sky-50 active:scale-95 text-left flex items-center"
                  >
                    <span className="w-8 h-8 rounded-full bg-sky-200 text-sky-800 flex items-center justify-center mr-4 shrink-0 text-sm">
                      {['A', 'B', 'C'][idx]}
                    </span>
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'LEVEL_COMPLETE':
        const nextLevelData = mockLevels.find((l) => l.id === currentLevel + 1);
        const hasNextLevel = nextLevelData && !nextLevelData.comingSoon;

        return (
          <div className="flex flex-col h-full w-full p-6 bg-gradient-to-b from-yellow-300 to-orange-400 items-center justify-center">
            <h2 className="text-5xl font-black text-white text-center drop-shadow-lg mb-8 transform -rotate-2">
              GREAT JOB!
            </h2>
            <div className="bg-white w-40 h-40 rounded-full shadow-2xl flex items-center justify-center border-8 border-yellow-100 mb-10 relative">
              <div className="absolute -top-4 -right-4 bg-green-500 rounded-full p-2 border-4 border-white">
                <Check className="w-8 h-8 text-white" strokeWidth={4} />
              </div>
              <Star className="w-20 h-20 text-yellow-400" fill="currentColor" />
            </div>
            
            {hasNextLevel && (
              <button
                onClick={() => {
                  setCurrentLevel(currentLevel + 1);
                  setScreen('IN_GAME');
                }}
                className="w-full py-4 bg-green-500 text-white font-black text-xl rounded-full shadow-[0_6px_0_#15803d] active:translate-y-[6px] active:shadow-none mb-4 flex justify-center items-center gap-2"
              >
                NEXT LEVEL <ArrowRight className="w-6 h-6" />
              </button>
            )}

            <button
              onClick={() => navTo('LEVEL_SELECT')}
              className="w-full py-4 bg-white text-orange-600 font-bold text-xl rounded-full shadow-[0_6px_0_#cbd5e1] active:translate-y-[6px] active:shadow-none"
            >
              BACK TO MAP
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-[360px] h-[800px] bg-white rounded-[40px] overflow-hidden border-[12px] border-gray-800 relative">
        {renderScreen()}
      </div>
    </div>
  );
}