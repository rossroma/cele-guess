import React, { useState, useEffect } from 'react';
import { Image, SpinLoading } from 'antd-mobile';
import type { Celebrity } from '../../types';
import './index.scss';

interface PhotoCardProps {
  celebrity: Celebrity;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ celebrity }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Trigger animation when celebrity changes
  useEffect(() => {
    setIsAnimating(true);
    setLoading(true);
    setError(false);

    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [celebrity.id]);

  return (
    <div className={`photo-card ${isAnimating ? 'photo-card-enter' : ''}`}>
      {loading && (
        <div className="photo-loading">
          <SpinLoading color="primary" />
        </div>
      )}

      {error ? (
        <div className="photo-error">
          图片加载失败
        </div>
      ) : (
        <Image
          src={celebrity.hdphoto || celebrity.photo}
          alt={celebrity.name}
          fit="contain"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      )}
    </div>
  );
};

export default PhotoCard;
