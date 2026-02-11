import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, Toast } from 'antd-mobile';
import { FilterOutline } from 'antd-mobile-icons';
import FilterPanel from '../../components/FilterPanel';
import { useFilterStore } from '../../store/useFilterStore';
import { useCelebrities } from '../../hooks/useCelebrities';
import './index.scss';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [filterVisible, setFilterVisible] = useState(false);
  const { hasActiveFilters } = useFilterStore();
  const { filteredCount, totalCount } = useCelebrities();

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
          开始游戏
        </Button>

        <Badge content={hasActiveFilters() ? '•' : null} color="red">
          <Button
            className="filter-button"
            fill="outline"
            onClick={() => setFilterVisible(true)}
          >
            <FilterOutline /> 筛选条件
          </Button>
        </Badge>

        <div className="stats">
          可玩明星: {filteredCount} / {totalCount}
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
