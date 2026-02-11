import { useSwipeable, SwipeEventData } from 'react-swipeable';

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export const useSwipe = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50
}: UseSwipeOptions) => {
  const handlers = useSwipeable({
    onSwipedLeft: (eventData: SwipeEventData) => {
      if (Math.abs(eventData.deltaX) > threshold) {
        onSwipeLeft?.();
      }
    },
    onSwipedRight: (eventData: SwipeEventData) => {
      if (Math.abs(eventData.deltaX) > threshold) {
        onSwipeRight?.();
      }
    },
    trackMouse: true,
    trackTouch: true,
    preventScrollOnSwipe: true
  });

  return handlers;
};
