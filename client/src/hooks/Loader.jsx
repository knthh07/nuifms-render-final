import React from 'react';
import { ClipLoader } from 'react-spinners';

const Loader = ({ isLoading }) => {
  const loaderContainerStyle = {
    position: 'fixed',
    top: '10px',
    right: '10px',
    zIndex: '9999',
    width: '80px',
    height: '80px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  return (
    isLoading && (
      <div style={loaderContainerStyle}>
        <ClipLoader loading={isLoading} size={50} color="#00BFFF" />
      </div>
    )
  );
};

export default Loader;
