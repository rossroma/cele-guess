import React, { useEffect } from 'react';
import type { FeedbackType } from '../../types';
import './index.scss';

interface NameSlotsProps {
  name: string;
  selectedChars: string[];
  feedbackType: FeedbackType;
  onRetryAnimationEnd: () => void;
}

const NameSlots: React.FC<NameSlotsProps> = ({
  name,
  selectedChars,
  feedbackType,
  onRetryAnimationEnd,
}) => {
  const chars = name.split('');

  // 抖动动画结束后通知父组件清空
  useEffect(() => {
    if (feedbackType === 'wrong-retry') {
      const timer = setTimeout(onRetryAnimationEnd, 650);
      return () => clearTimeout(timer);
    }
  }, [feedbackType, onRetryAnimationEnd]);

  const getDisplayChar = (index: number): string => {
    if (feedbackType === 'wrong-revealed') return chars[index];
    return selectedChars[index] || '';
  };

  const getSlotClassName = (index: number): string => {
    const hasChar = !!selectedChars[index];
    const base = 'name-slot';

    if (feedbackType === 'correct') return `${base} slot-correct`;
    if (feedbackType === 'wrong-retry') return `${base} slot-wrong slot-shake`;
    if (feedbackType === 'wrong-revealed') return `${base} slot-revealed`;
    if (hasChar) return `${base} slot-filled`;
    return `${base} slot-empty`;
  };

  return (
    <div className="name-slots">
      {chars.map((_, index) => (
        <div key={index} className={getSlotClassName(index)}>
          <span className="slot-char">{getDisplayChar(index)}</span>
        </div>
      ))}
    </div>
  );
};

export default NameSlots;
