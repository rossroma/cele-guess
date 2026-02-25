import React, { useEffect } from 'react';
import type { FeedbackType } from '../../types';
import './index.scss';

interface NameSlotsProps {
  name: string;
  slots: string[];
  feedbackType: FeedbackType;
  targetSlotIndex: number | null;
  onSlotClick: (index: number) => void;
  onRetryAnimationEnd: () => void;
}

const NameSlots: React.FC<NameSlotsProps> = ({
  name,
  slots,
  feedbackType,
  targetSlotIndex,
  onSlotClick,
  onRetryAnimationEnd,
}) => {
  const chars = name.split('');

  useEffect(() => {
    if (feedbackType === 'wrong-retry') {
      const timer = setTimeout(onRetryAnimationEnd, 650);
      return () => clearTimeout(timer);
    }
  }, [feedbackType, onRetryAnimationEnd]);

  const getDisplayChar = (index: number): string => {
    if (feedbackType === 'wrong-revealed') return chars[index];
    return slots[index] || '';
  };

  const getSlotClassName = (index: number): string => {
    const hasChar = !!slots[index];
    const isTargeted = targetSlotIndex === index;
    const base = 'name-slot';

    if (feedbackType === 'correct') return `${base} slot-correct`;
    if (feedbackType === 'wrong-retry') return `${base} slot-wrong slot-shake`;
    if (feedbackType === 'wrong-revealed') return `${base} slot-revealed`;
    if (isTargeted) return `${base} slot-targeted`;
    if (hasChar) return `${base} slot-filled`;
    return `${base} slot-empty`;
  };

  const canClick = (index: number): boolean =>
    feedbackType === null && !!slots[index];

  return (
    <div className="name-slots">
      {chars.map((_, index) => (
        <div
          key={index}
          className={getSlotClassName(index)}
          onClick={() => canClick(index) && onSlotClick(index)}
        >
          <span className="slot-char">{getDisplayChar(index)}</span>
        </div>
      ))}
    </div>
  );
};

export default NameSlots;
