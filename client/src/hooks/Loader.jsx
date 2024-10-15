import React from 'react';
import Lottie from 'react-lottie';
import animationData from '../assets/animation/loader_lottie_2.json';

const Loader = ({ isLoading }) => {
  const defaultOptions = {
    loop: true,
    autoplay: true, // Starts the animation automatically
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice', // Preserves the aspect ratio of the animation
    },
  };

  return (
    isLoading && (
      <div style={{ width: '80px', height: '80px' }}>
        <Lottie options={defaultOptions} height={80} width={80} />
      </div>
    )
  );
};

export default Loader;
