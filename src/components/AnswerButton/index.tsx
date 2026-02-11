import React from 'react';
import { Button } from 'antd-mobile';
import { EyeOutline } from 'antd-mobile-icons';
import './index.scss';

interface AnswerButtonProps {
  name: string;
  isVisible: boolean;
  onShow: () => void;
}

const AnswerButton: React.FC<AnswerButtonProps> = ({
  name,
  isVisible,
  onShow
}) => {
  return (
    <div className="answer-button-container">
      {isVisible ? (
        <div className="answer-display">
          <h2 className="celebrity-name">{name}</h2>
        </div>
      ) : (
        <Button
          className="reveal-button"
          size="large"
          color="primary"
          onClick={onShow}
        >
          <EyeOutline /> 查看答案
        </Button>
      )}
    </div>
  );
};

export default AnswerButton;
