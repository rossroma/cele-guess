import React from 'react';
import { Popup, Checkbox, Button, Space } from 'antd-mobile';
import { useFilterStore } from '../../store/useFilterStore';
import {
  RegionEnum,
  GenderEnum,
  ProfessionEnum,
  REGION_LABELS,
  GENDER_LABELS,
  PROFESSION_LABELS
} from '../../types';
import './index.scss';

interface FilterPanelProps {
  visible: boolean;
  onClose: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ visible, onClose }) => {
  const { filters, setFilters, resetFilters } = useFilterStore();

  // 获取所有枚举值
  const regionOptions = Object.values(RegionEnum).filter(v => typeof v === 'number') as RegionEnum[];
  const genderOptions = Object.values(GenderEnum).filter(v => typeof v === 'number') as GenderEnum[];
  const professionOptions = Object.values(ProfessionEnum).filter(v => typeof v === 'number') as ProfessionEnum[];

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      position="bottom"
      bodyStyle={{ minHeight: '50vh' }}
    >
      <div className="filter-panel">
        <div className="filter-header">
          <h3>筛选条件</h3>
          <Button size="small" fill="none" onClick={resetFilters}>
            重置
          </Button>
        </div>

        <div className="filter-section">
          <h4>地区</h4>
          <Checkbox.Group
            value={filters.regions}
            onChange={(val) => setFilters({ regions: val as RegionEnum[] })}
          >
            <Space direction="vertical">
              {regionOptions.map((region) => (
                <Checkbox key={region} value={region}>
                  {REGION_LABELS[region]}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </div>

        <div className="filter-section">
          <h4>性别</h4>
          <Checkbox.Group
            value={filters.genders}
            onChange={(val) => setFilters({ genders: val as GenderEnum[] })}
          >
            <Space>
              {genderOptions.map((gender) => (
                <Checkbox key={gender} value={gender}>
                  {GENDER_LABELS[gender]}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </div>

        <div className="filter-section">
          <h4>职业</h4>
          <Checkbox.Group
            value={filters.professions}
            onChange={(val) => setFilters({ professions: val as ProfessionEnum[] })}
          >
            <Space direction="vertical">
              {professionOptions.map((profession) => (
                <Checkbox key={profession} value={profession}>
                  {PROFESSION_LABELS[profession]}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </div>

        <div className="filter-footer">
          <Button block color="primary" onClick={onClose}>
            确认
          </Button>
        </div>
      </div>
    </Popup>
  );
};

export default FilterPanel;
