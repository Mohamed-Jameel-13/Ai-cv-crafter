import React from 'react';
import styled from 'styled-components';
import { Brain, Loader2, Sparkles } from 'lucide-react';

const AIButton = ({ 
  onClick, 
  loading = false, 
  disabled = false, 
  size = 'sm',
  className = '',
  children,
  loadingText = 'Generating...',
  icon = 'brain' // 'brain', 'sparkles', or custom element
}) => {
  const IconComponent = icon === 'sparkles' ? Sparkles : Brain;

  const sizeStyles = {
    sm: { padding: '0.6em 1em', fontSize: '14px' },
    md: { padding: '0.8em 1.2em', fontSize: '16px' },
    lg: { padding: '1em 1.5em', fontSize: '18px' }
  };

  return (
    <StyledWrapper className={className}>
      <StyledButton
        onClick={onClick}
        disabled={loading || disabled}
        $size={size}
        $sizeStyles={sizeStyles[size]}
      >
        <span>
          {loading ? (
            <>
              <Loader2 className="icon animate-spin" />
              <span className="text hidden sm:inline">{loadingText}</span>
            </>
          ) : (
            <>
              {React.isValidElement(icon) ? icon : <IconComponent className="icon" />}
              <span className="text hidden sm:inline">
                {children || 'Generate with AI'}
              </span>
              <span className="text-mobile sm:hidden">AI</span>
            </>
          )}
        </span>
      </StyledButton>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .icon {
    width: 16px;
    height: 16px;
    margin-right: 8px;
    flex-shrink: 0;
  }

  .text {
    font-weight: 500;
  }

  .text-mobile {
    font-weight: 500;
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .hidden {
    display: none;
  }

  @media (min-width: 640px) {
    .hidden.sm\\:inline {
      display: inline;
    }
    .sm\\:hidden {
      display: none;
    }
  }
`;

const StyledButton = styled.button`
  position: relative;
  margin: 0;
  padding: ${props => props.$sizeStyles.padding};
  outline: none;
  text-decoration: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: none;
  background: #333;
  border-radius: 10px;
  color: #fff;
  font-weight: 500;
  font-size: ${props => props.$sizeStyles.fontSize};
  font-family: inherit;
  z-index: 0;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.02, 0.01, 0.47, 1);
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
  min-width: 140px;

  span {
    display: flex;
    align-items: center;
    flex-direction: row;
    white-space: nowrap;
  }

  &:hover:not(:disabled) {
    animation: sh0 0.5s ease-in-out both;
    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @keyframes sh0 {
    0% {
      transform: rotate(0deg) translate3d(0, 0, 0);
    }
    25% {
      transform: rotate(7deg) translate3d(0, 0, 0);
    }
    50% {
      transform: rotate(-7deg) translate3d(0, 0, 0);
    }
    75% {
      transform: rotate(1deg) translate3d(0, 0, 0);
    }
    100% {
      transform: rotate(0deg) translate3d(0, 0, 0);
    }
  }

  &:hover:not(:disabled) span {
    animation: storm 0.7s ease-in-out both;
    animation-delay: 0.06s;
  }

  @keyframes storm {
    0% {
      transform: translate3d(0, 0, 0) translateZ(0);
    }
    25% {
      transform: translate3d(4px, 0, 0) translateZ(0);
    }
    50% {
      transform: translate3d(-3px, 0, 0) translateZ(0);
    }
    75% {
      transform: translate3d(2px, 0, 0) translateZ(0);
    }
    100% {
      transform: translate3d(0, 0, 0) translateZ(0);
    }
  }

  &::before,
  &::after {
    content: '';
    position: absolute;
    right: 0;
    bottom: 0;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: #fff;
    opacity: 0;
    transition: transform 0.15s cubic-bezier(0.02, 0.01, 0.47, 1), opacity 0.15s cubic-bezier(0.02, 0.01, 0.47, 1);
    z-index: -1;
    transform: translate(100%, -25%) translate3d(0, 0, 0);
  }

  &:hover:not(:disabled)::before,
  &:hover:not(:disabled)::after {
    opacity: 0.15;
    transition: transform 0.2s cubic-bezier(0.02, 0.01, 0.47, 1), opacity 0.2s cubic-bezier(0.02, 0.01, 0.47, 1);
  }

  &:hover:not(:disabled)::before {
    transform: translate3d(50%, 0, 0) scale(0.9);
  }

  &:hover:not(:disabled)::after {
    transform: translate(50%, 0) scale(1.1);
  }
`;

export { AIButton }; 