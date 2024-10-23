import React from 'react';
import { ThreeCircles } from 'react-loader-spinner';

const Loader = ({ isLoading }) => {
  const loaderContainerStyle = {
    position: 'fixed',
    bottom: '20px', // Adjust to place it at the bottom
    right: '20px', // Adjust to place it to the right
    zIndex: '9999',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#323232', // Dark background for snackbar look
    color: '#ffffff', // White text color
    borderRadius: '8px', // Rounded corners
    padding: '16px', // Spacing inside the snackbar
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)', // Shadow for depth
    transition: 'opacity 0.3s ease', // Smooth fade-in/out
    opacity: isLoading ? 1 : 0, // Fade effect when loading
  };

  return (
    isLoading && (
      <div style={loaderContainerStyle}>
        <ThreeCircles
          visible={true}
          height="40" // Adjust size for snackbar look
          width="40" // Adjust size for snackbar look
          color="#4fa94d"
          ariaLabel="three-circles-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
        <span style={{ marginLeft: '10px' }}>Loading...</span> {/* Optional text */}
      </div>
    )
  );
};

export default Loader;
