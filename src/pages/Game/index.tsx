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
import { useImageColors } from '../../hooks/useImageColors';
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
    showAnswer,
    incrementViewedCount,
    addToHistory,
    goNext,
    goPrevious
  } = useGameStore();

  // 提取图片颜色用于背景
  const imageColors = useImageColors(currentCelebrity?.hdphoto || currentCelebrity?.photo);

  // 加载随机明星
  const loadRandomCelebrity = useCallback(() => {
    const celebrity = getRandomCelebrity(
      filteredCelebrities,
      currentCelebrity?.id
    );

    if (celebrity) {
      addToHistory(celebrity);
      incrementViewedCount();
    } else {
      Toast.show({
        content: '没有更多明星了',
        position: 'top'
      });
    }
  }, [filteredCelebrities, currentCelebrity, addToHistory, incrementViewedCount]);

  // 下一张
  const handleNext = useCallback(() => {
    const needsNewCelebrity = goNext();
    if (needsNewCelebrity) {
      loadRandomCelebrity();
    }
  }, [goNext, loadRandomCelebrity]);

  // 上一张
  const handlePrevious = useCallback(() => {
    const success = goPrevious();
    if (!success) {
      Toast.show({
        content: '已经是第一张了',
        position: 'top'
      });
    }
  }, [goPrevious]);

  // 初始化加载
  useEffect(() => {
    if (!currentCelebrity) {
      loadRandomCelebrity();
    }
  }, [currentCelebrity, loadRandomCelebrity]);

  // 键盘事件监听
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious(); // 左箭头：上一张
      } else if (e.key === 'ArrowRight') {
        handleNext(); // 右箭头：下一张
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (!isAnswerVisible) {
          showAnswer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAnswerVisible, showAnswer, handleNext, handlePrevious]);

  // 滑动手势
  const swipeHandlers = useSwipe({
    onSwipeLeft: handleNext,      // 左滑：下一张
    onSwipeRight: handlePrevious  // 右滑：上一张
  });

  const handleBack = () => {
    navigate('/');
  };

  if (!currentCelebrity) {
    return <div className="game-loading">加载中...</div>;
  }

  // 动态背景样式
  const backgroundStyle = {
    background: `linear-gradient(135deg, ${imageColors.primary} 0%, ${imageColors.secondary} 50%, ${imageColors.primary} 100%)`,
    transition: 'background 0.8s ease-in-out'
  };

  return (
    <div className="game-page" {...swipeHandlers} style={backgroundStyle}>
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
              onClick={handlePrevious}
            >
              <LeftOutline /> 上一张
            </Button>
            <Button
              className="nav-button next"
              shape="rounded"
              onClick={handleNext}
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
