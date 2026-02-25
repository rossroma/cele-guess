import React from 'react';
import type { FeedbackType } from '../../types';
import './index.scss';

interface CharacterPoolProps {
  charPool: string[];
  usedPoolIndices: number[];
  feedbackType: FeedbackType;
  onSelectChar: (poolIndex: number) => void;
}

const CharacterPool: React.FC<CharacterPoolProps> = ({
  charPool,
  usedPoolIndices,
  feedbackType,
  onSelectChar,
}) => {
  const isDisabled = feedbackType !== null;

  return (
    <div className="char-pool">
      {charPool.map((char, index) => {
        const isUsed = usedPoolIndices.includes(index);
        return (
          <button
            key={index}
            className={`char-btn ${isUsed ? 'char-btn-used' : ''} ${isDisabled && !isUsed ? 'char-btn-locked' : ''}`}
            onClick={() => !isUsed && !isDisabled && onSelectChar(index)}
            disabled={isUsed || isDisabled}
          >
            {char}
          </button>
        );
      })}
    </div>
  );
};

export default CharacterPool;
