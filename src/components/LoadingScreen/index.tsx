import React from 'react';
import { Spin } from 'antd';

const LoadingScreen = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000, // Ensure it's on top of everything
      }}
    >
      <Spin size="large" tip="Loading..." fullscreen={true} />
    </div>
  );
};

export default LoadingScreen;
