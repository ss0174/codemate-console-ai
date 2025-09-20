import React, { useState, useRef, useEffect } from 'react';

interface TerminalInputProps {
  currentPath: string;
  onCommand: (command: string) => void;
  onNavigateHistory: (direction: 'up' | 'down') => string;
  getAutocompleteSuggestions: (input: string) => string[];
}

export const TerminalInput: React.FC<TerminalInputProps> = ({
  currentPath,
  onCommand,
  onNavigateHistory,
  getAutocompleteSuggestions,
}) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount and keep it focused
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Update suggestions when input changes
    if (input.trim()) {
      const newSuggestions = getAutocompleteSuggestions(input);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      setSelectedSuggestion(0);
    } else {
      setShowSuggestions(false);
    }
  }, [input, getAutocompleteSuggestions]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (showSuggestions && suggestions.length > 0) {
          const suggestion = suggestions[selectedSuggestion];
          const words = input.split(' ');
          words[words.length - 1] = suggestion;
          setInput(words.join(' ') + ' ');
          setShowSuggestions(false);
        } else {
          onCommand(input);
          setInput('');
          setShowSuggestions(false);
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (showSuggestions) {
          setSelectedSuggestion(Math.max(0, selectedSuggestion - 1));
        } else {
          const historyCommand = onNavigateHistory('up');
          setInput(historyCommand);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (showSuggestions) {
          setSelectedSuggestion(Math.min(suggestions.length - 1, selectedSuggestion + 1));
        } else {
          const historyCommand = onNavigateHistory('down');
          setInput(historyCommand);
        }
        break;

      case 'Tab':
        e.preventDefault();
        if (suggestions.length > 0) {
          const suggestion = suggestions[selectedSuggestion];
          const words = input.split(' ');
          words[words.length - 1] = suggestion;
          setInput(words.join(' ') + ' ');
          setShowSuggestions(false);
        }
        break;

      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getDisplayPath = (path: string) => {
    return path.replace('/home/user', '~');
  };

  return (
    <div className="relative">
      <div className="flex items-center" onClick={handleClick}>
        <span className="text-terminal-prompt terminal-glow">user@codemate</span>
        <span className="text-terminal-text-dim mx-1">:</span>
        <span className="text-terminal-path">{getDisplayPath(currentPath)}</span>
        <span className="text-terminal-prompt mx-1">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-terminal-text caret-terminal-cursor"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
        />
        <span className="terminal-cursor text-terminal-cursor">█</span>
      </div>

      {/* Autocomplete suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 mt-1 bg-terminal-surface border border-terminal-border rounded-md shadow-lg z-10 min-w-48">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`px-3 py-1 cursor-pointer text-sm ${
                index === selectedSuggestion
                  ? 'bg-terminal-border text-terminal-text'
                  : 'text-terminal-text-dim hover:bg-terminal-border hover:text-terminal-text'
              }`}
              onClick={() => {
                const words = input.split(' ');
                words[words.length - 1] = suggestion;
                setInput(words.join(' ') + ' ');
                setShowSuggestions(false);
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
