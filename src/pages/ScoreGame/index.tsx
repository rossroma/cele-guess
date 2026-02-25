import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, SpinLoading } from 'antd-mobile';
import { LeftOutline } from 'antd-mobile-icons';
import { Image } from 'antd-mobile';
import NameSlots from '../../components/NameSlots';
import CharacterPool from '../../components/CharacterPool';
import { useScoreGameStore } from '../../store/useScoreGameStore';
import { useCelebrities } from '../../hooks/useCelebrities';
import { useImageColors } from '../../hooks/useImageColors';
import { generateCharPool, pickRandomCelebrities, getHighScore } from '../../utils/scoreGame';
import './index.scss';

const GAME_SIZE = 10;
const POOL_SIZE = 27;

const ScoreGame: React.FC = () => {
  const navigate = useNavigate();
  const { allCelebrities, filteredCelebrities } = useCelebrities();

  const {
    phase,
    celebrities,
    currentIndex,
    charPool,
    slots,
    slotPoolIndices,
    targetSlotIndex,
    wrongAttempts,
    feedbackType,
    rounds,
    totalScore,
    correctCount,
    isNewHighScore,
    initGame,
    selectChar,
    setTargetSlot,
    clearForRetry,
    nextRound,
    resetGame,
  } = useScoreGameStore();

  // 当前被占用的字符池位置（排除瞄准槽，允许替换）
  const usedPoolIndices = slotPoolIndices.filter(
    (idx, slotIdx): idx is number => idx !== null && slotIdx !== targetSlotIndex
  );

  const celebrity = celebrities[currentIndex] ?? null;
  const imageColors = useImageColors(celebrity?.hdphoto || celebrity?.photo);

  // 浮动得分提示
  const [scorePopup, setScorePopup] = useState<{ value: number; key: number } | null>(null);
  const scorePopupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [photoLoading, setPhotoLoading] = useState(true);
  const [photoError, setPhotoError] = useState(false);

  // 初始化游戏
  useEffect(() => {
    if (phase === 'idle') {
      const pool = filteredCelebrities.length > 0 ? filteredCelebrities : allCelebrities;
      const picked = pickRandomCelebrities(pool, GAME_SIZE);
      if (picked.length === 0) return;
      const firstPool = generateCharPool(picked[0], allCelebrities, POOL_SIZE);
      initGame(picked, firstPool);
    }
  }, [phase, filteredCelebrities, allCelebrities, initGame]);

  // 每次切换明星时重置图片状态
  useEffect(() => {
    setPhotoLoading(true);
    setPhotoError(false);
  }, [currentIndex]);

  // 答对时显示得分浮动提示
  useEffect(() => {
    if (feedbackType === 'correct') {
      const lastRound = rounds[rounds.length - 1];
      if (lastRound && lastRound.scoreEarned > 0) {
        if (scorePopupTimerRef.current) clearTimeout(scorePopupTimerRef.current);
        setScorePopup({ value: lastRound.scoreEarned, key: Date.now() });
        scorePopupTimerRef.current = setTimeout(() => setScorePopup(null), 1200);
      }
    }
    return () => {
      if (scorePopupTimerRef.current) clearTimeout(scorePopupTimerRef.current);
    };
  }, [feedbackType, rounds]);

  const handleNextRound = useCallback(() => {
    if (!celebrity) return;
    const nextIdx = currentIndex + 1;
    if (nextIdx < celebrities.length) {
      const nextPool = generateCharPool(celebrities[nextIdx], allCelebrities, POOL_SIZE);
      nextRound(nextPool);
    } else {
      nextRound([]);
    }
  }, [celebrity, currentIndex, celebrities, allCelebrities, nextRound]);

  const handlePlayAgain = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const handleBack = () => {
    resetGame();
    navigate('/');
  };

  const backgroundStyle = {
    background: `linear-gradient(135deg, ${imageColors.primary} 0%, ${imageColors.secondary} 50%, ${imageColors.primary} 100%)`,
    transition: 'background 0.8s ease-in-out',
  };

  if (phase === 'idle' || !celebrity) {
    return (
      <div className="score-game-page score-game-loading">
        <SpinLoading color="primary" />
        <p>正在准备题目…</p>
      </div>
    );
  }

  if (phase === 'gameEnd') {
    return (
      <div className="score-game-page score-game-end">
        <div className="end-card">
          <div className="end-title">游戏结束</div>
          <div className="end-score-label">最终得分</div>
          <div className="end-score">{totalScore}</div>
          <div className="end-meta">
            <span>答对 {correctCount} / {GAME_SIZE} 题</span>
            <span>满分 {GAME_SIZE * 3} 分</span>
          </div>
          {isNewHighScore && (
            <div className="end-new-high">🎉 新纪录！</div>
          )}
          <div className="end-history">
            历史最高：<strong>{getHighScore()}</strong> 分
          </div>
          <div className="end-round-list">
            {rounds.map((r, i) => (
              <div key={i} className={`end-round-item ${r.isCorrect ? 'round-correct' : 'round-wrong'}`}>
                <span className="round-name">{r.celebrity.name}</span>
                <span className="round-score">
                  {r.isCorrect
                    ? (r.wrongAttempts === 0 ? '+3' : '+1')
                    : '未答出'}
                </span>
              </div>
            ))}
          </div>
          <div className="end-actions">
            <Button color="primary" size="large" onClick={handlePlayAgain}>
              再来一局
            </Button>
            <Button fill="outline" size="large" onClick={handleBack}>
              返回首页
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const attemptsLeft = wrongAttempts === 0 ? 2 : 1;

  return (
    <div className="score-game-page" style={backgroundStyle}>
      <div className="sg-overlay" />

      {/* 得分浮动提示 */}
      {scorePopup && (
        <div className="score-popup" key={scorePopup.key}>
          +{scorePopup.value}
        </div>
      )}

      {/* Header */}
      <div className="sg-header">
        <button className="sg-back-btn" onClick={handleBack}>
          <LeftOutline /> 返回
        </button>
        <div className="sg-progress">
          {currentIndex + 1} / {celebrities.length}
        </div>
        <div className="sg-score">
          🏆 {totalScore}
        </div>
      </div>

      {/* 照片区 */}
      <div className="sg-photo">
        {photoLoading && (
          <div className="sg-photo-loading">
            <SpinLoading color="white" />
          </div>
        )}
        {photoError ? (
          <div className="sg-photo-error">图片加载失败</div>
        ) : (
          <Image
            src={celebrity.hdphoto || celebrity.photo}
            alt={celebrity.name}
            fit="cover"
            style={{ width: '100%', height: '100%', opacity: photoLoading ? 0 : 1, transition: 'opacity 0.3s' }}
            onLoad={() => setPhotoLoading(false)}
            onError={() => { setPhotoLoading(false); setPhotoError(true); }}
          />
        )}
        {/* 答题次数提示 */}
        {phase === 'playing' && (
          <div className="sg-attempts-hint">
            {wrongAttempts === 0 ? `答对得 +3 分` : `还有 ${attemptsLeft} 次机会`}
          </div>
        )}
      </div>

      {/* 姓名方格 */}
      <div className="sg-name-area">
        <NameSlots
          name={celebrity.name}
          slots={slots}
          feedbackType={feedbackType}
          targetSlotIndex={targetSlotIndex}
          onSlotClick={setTargetSlot}
          onRetryAnimationEnd={clearForRetry}
        />
      </div>

      {/* 字符池 */}
      <div className="sg-char-pool-area">
        <CharacterPool
          charPool={charPool}
          usedPoolIndices={usedPoolIndices}
          feedbackType={feedbackType}
          onSelectChar={selectChar}
        />
      </div>

      {/* 本轮结束浮层 */}
      {phase === 'roundEnd' && (
        <div className="sg-round-result">
          <div className={`round-result-card ${feedbackType === 'correct' ? 'result-correct' : 'result-wrong'}`}>
            {feedbackType === 'correct' ? (
              <>
                <div className="result-icon">✓</div>
                <div className="result-text">
                  {rounds[rounds.length - 1]?.wrongAttempts === 0
                    ? '一次答对！+3 分'
                    : '答对了！+1 分'}
                </div>
              </>
            ) : (
              <>
                <div className="result-icon">✗</div>
                <div className="result-text">正确答案：{celebrity.name}</div>
              </>
            )}
            <Button
              className="result-next-btn"
              color="primary"
              size="large"
              onClick={handleNextRound}
            >
              {currentIndex + 1 < celebrities.length ? '下一位 →' : '查看结果'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreGame;
