import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Toast } from 'antd-mobile';
import FilterPanel from '../../components/FilterPanel';
import { useCelebrities } from '../../hooks/useCelebrities';
import './index.scss';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [filterVisible, setFilterVisible] = useState(false);
  const { filteredCount } = useCelebrities();

  const handleStart = () => {
    if (filteredCount === 0) {
      Toast.show({
        content: '没有符合条件的明星，请调整筛选条件',
        position: 'center'
      });
      return;
    }
    navigate('/game');
  };

  const handleScoreMode = () => {
    navigate('/score-game');
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <h1 className="home-title">CeleGuess</h1>
        <p className="home-subtitle">明星猜猜看</p>
      </div>

      <div className="home-content">
        <Button
          className="start-button"
          size="large"
          color="primary"
          onClick={handleStart}
        >
          自由浏览模式
        </Button>
        <Button
          className="start-button score-mode-button"
          size="large"
          onClick={handleScoreMode}
        >
          🏆 计分模式
        </Button>

        {/* <Badge content={hasActiveFilters() ? '•' : null} color="red">
          <Button
            className="filter-button"
            fill="outline"
            onClick={() => setFilterVisible(true)}
          >
            <FilterOutline /> 筛选条件
          </Button>
        </Badge> */}

        <div className="stats">
          {/* 可玩明星: {filteredCount} / {totalCount} */}
        </div>
      </div>

      <FilterPanel
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
      />
    </div>
  );
};

export default Home;
