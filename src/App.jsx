import React, { useState } from 'react';
import { Search, Play, Home } from 'lucide-react';

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
  }
];

export default function App() {
  const [screen, setScreen] = useState('HOME');
  const [currentLevel, setCurrentLevel] = useState(1);

  const navTo = (newScreen) => {
    setScreen(newScreen);
  };

  const handleAnswer = (index) => {
    const data = mockLevels.find((l) => l.id === currentLevel);
    if (index === data.correct) {
      navTo('HOME'); 
    } else {
      console.log('Wrong answer selected');
    }
  };

  const renderScreen = () => {
    switch (screen) {
      case 'HOME':
        return (
          <div className="flex flex-col h-full w-full items-center justify-center p-6 bg-sky-200">
            <h1 className="text-4xl font-black text-blue-900 mb-12 text-center">
              LITTLE<br />DETECTIVE
            </h1>
            <button
              onClick={() => navTo('LEVEL_SELECT')}
              className="w-48 h-48 rounded-full bg-blue-500 shadow-xl flex items-center justify-center text-white"
            >
              <Play className="w-24 h-24 ml-4" fill="currentColor" />
            </button>
          </div>
        );

      case 'LEVEL_SELECT':
        return (
          <div className="flex flex-col h-full w-full p-6 bg-orange-50">
            <div className="flex items-center mb-8">
              <button onClick={() => navTo('HOME')} className="p-2 bg-white rounded-full">
                <Home className="w-6 h-6 text-orange-500" />
              </button>
              <h2 className="text-2xl font-black ml-4 text-orange-800">Choose Level</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {mockLevels.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => {
                    setCurrentLevel(lvl.id);
                    navTo('IN_GAME');
                  }}
                  className="aspect-square bg-sky-400 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-md"
                >
                  {lvl.id}
                </button>
              ))}
            </div>
          </div>
        );

      case 'IN_GAME':
        const levelData = mockLevels.find((l) => l.id === currentLevel);
        return (
          <div className="flex flex-col h-full w-full bg-blue-50 p-6">
            <button onClick={() => navTo('LEVEL_SELECT')} className="mb-4 text-blue-500 font-bold">
              Back
            </button>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
              <p className="text-lg text-gray-700 italic">"{levelData.clue}"</p>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {levelData.question}
            </h3>

            <div className="space-y-4">
              {levelData.choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className="w-full bg-white p-4 rounded-xl shadow border border-gray-200 text-xl font-bold text-gray-700 text-left"
                >
                  {choice}
                </button>
              ))}
            </div>
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