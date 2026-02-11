import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Toast } from 'antd-mobile';
import { LeftOutline, RightOutline } from 'antd-mobile-icons';
import PhotoCard from '../../components/PhotoCard';
import AnswerButton from '../../components/AnswerButton';
import { useGameStore } from '../../store/useGameStore';
import { useCelebrities } from '../../hooks/useCelebrities';
import { useSwipe } from '../../hooks/useSwipe';
import { useResponsive } from '../../hooks/useResponsive';
import { getRandomCelebrity } from '../../utils/random';
import './index.scss';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const { filteredCelebrities } = useCelebrities();
  const {
    currentCelebrity,
    isAnswerVisible,
    viewedCount,
    setCurrentCelebrity,
    showAnswer,
    incrementViewedCount
  } = useGameStore();

  // 加载随机明星
  const loadRandomCelebrity = useCallback(() => {
    const celebrity = getRandomCelebrity(
      filteredCelebrities,
      currentCelebrity?.id
    );

    if (celebrity) {
      setCurrentCelebrity(celebrity);
      incrementViewedCount();
    } else {
      Toast.show({
        content: '没有更多明星了',
        position: 'top'
      });
    }
  }, [filteredCelebrities, currentCelebrity, setCurrentCelebrity, incrementViewedCount]);

  // 初始化加载
  useEffect(() => {
    if (!currentCelebrity) {
      loadRandomCelebrity();
    }
  }, [currentCelebrity, loadRandomCelebrity]);

  // 键盘事件监听
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        loadRandomCelebrity();
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (!isAnswerVisible) {
          showAnswer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAnswerVisible, showAnswer, loadRandomCelebrity]);

  // 滑动手势
  const swipeHandlers = useSwipe({
    onSwipeLeft: loadRandomCelebrity,
    onSwipeRight: loadRandomCelebrity
  });

  const handleBack = () => {
    navigate('/');
  };

  if (!currentCelebrity) {
    return <div className="game-loading">加载中...</div>;
  }

  return (
    <div className="game-page" {...swipeHandlers}>
      <div className="game-header">
        <Button
          fill="none"
          onClick={handleBack}
          className="back-button"
        >
          <LeftOutline /> 返回
        </Button>
        <span className="viewed-count">已查看: {viewedCount}</span>
      </div>

      <div className="game-content">
        <PhotoCard celebrity={currentCelebrity} />

        <AnswerButton
          name={currentCelebrity.name}
          isVisible={isAnswerVisible}
          onShow={showAnswer}
        />

        {!isMobile && (
          <div className="navigation-buttons">
            <Button
              className="nav-button prev"
              shape="rounded"
              onClick={loadRandomCelebrity}
            >
              <LeftOutline /> 上一张
            </Button>
            <Button
              className="nav-button next"
              shape="rounded"
              onClick={loadRandomCelebrity}
            >
              下一张 <RightOutline />
            </Button>
          </div>
        )}
      </div>

      {isMobile && (
        <div className="swipe-hint">
          左右滑动切换
        </div>
      )}
    </div>
  );
};

export default Game;
