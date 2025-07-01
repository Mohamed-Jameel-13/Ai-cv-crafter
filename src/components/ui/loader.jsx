import React from 'react';

const Loader = () => {
  // Define the CSS as a string to inject into a style tag
  const spinnerCSS = `
    .custom-spinner {
      position: relative;
      width: 9px;
      height: 9px;
    }

    .custom-spinner div {
      position: absolute;
      width: 50%;
      height: 150%;
      background: #000000;
      animation: spinner-fzua35 1s infinite ease;
    }

    .custom-spinner div:nth-child(1) {
      animation-delay: 0.1s;
      transform: rotate(36deg) translate(0, 150%);
    }

    .custom-spinner div:nth-child(2) {
      animation-delay: 0.2s;
      transform: rotate(72deg) translate(0, 150%);
    }

    .custom-spinner div:nth-child(3) {
      animation-delay: 0.3s;
      transform: rotate(108deg) translate(0, 150%);
    }

    .custom-spinner div:nth-child(4) {
      animation-delay: 0.4s;
      transform: rotate(144deg) translate(0, 150%);
    }

    .custom-spinner div:nth-child(5) {
      animation-delay: 0.5s;
      transform: rotate(180deg) translate(0, 150%);
    }

    .custom-spinner div:nth-child(6) {
      animation-delay: 0.6s;
      transform: rotate(216deg) translate(0, 150%);
    }

    .custom-spinner div:nth-child(7) {
      animation-delay: 0.7s;
      transform: rotate(252deg) translate(0, 150%);
    }

    .custom-spinner div:nth-child(8) {
      animation-delay: 0.8s;
      transform: rotate(288deg) translate(0, 150%);
    }

    .custom-spinner div:nth-child(9) {
      animation-delay: 0.9s;
      transform: rotate(324deg) translate(0, 150%);
    }

    .custom-spinner div:nth-child(10) {
      animation-delay: 1s;
      transform: rotate(360deg) translate(0, 150%);
    }

    @keyframes spinner-fzua35 {
      0%, 10%, 20%, 30%, 50%, 60%, 70%, 80%, 90%, 100% {
        opacity: 1;
        transform: rotate(calc(var(--rotation, 0deg))) translate(0, 150%);
      }
      50% {
        opacity: 0.5;
        transform: rotate(calc(var(--rotation, 0deg))) translate(0, 225%);
      }
    }

    .custom-spinner div:nth-child(1) { --rotation: 36deg; }
    .custom-spinner div:nth-child(2) { --rotation: 72deg; }
    .custom-spinner div:nth-child(3) { --rotation: 108deg; }
    .custom-spinner div:nth-child(4) { --rotation: 144deg; }
    .custom-spinner div:nth-child(5) { --rotation: 180deg; }
    .custom-spinner div:nth-child(6) { --rotation: 216deg; }
    .custom-spinner div:nth-child(7) { --rotation: 252deg; }
    .custom-spinner div:nth-child(8) { --rotation: 288deg; }
    .custom-spinner div:nth-child(9) { --rotation: 324deg; }
    .custom-spinner div:nth-child(10) { --rotation: 360deg; }
  `;

  return (
    <div className="flex items-center justify-center w-full py-20">
      <style dangerouslySetInnerHTML={{ __html: spinnerCSS }} />
      <div className="custom-spinner">
        <div />   
        <div />    
        <div />    
        <div />    
        <div />    
        <div />    
        <div />    
        <div />    
        <div />    
        <div />    
      </div>
    </div>
  );
};

export default Loader; 