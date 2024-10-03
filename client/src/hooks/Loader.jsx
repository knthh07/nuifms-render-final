import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import animationData from '../assets/animation/loader_lottie_2.json';

const Loader = ({ isLoading }) => {
  const loaderContainerStyle = {
    position: 'fixed',
    top: '10px',
    right: '10px',
    zIndex: '9999',
    width: '80px',
    height: '80px',
  };

  return (
    isLoading && (
      <div style={loaderContainerStyle}>
        <Player autoplay loop src={animationData} style={{ width: '100%', height: '100%' }} />
      </div>
    )
  );
};

export default Loader;
