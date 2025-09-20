import { useState, useCallback, useRef, useEffect } from 'react';
import { TerminalOutput } from '@/types/terminal';
import { terminalCommands } from '@/lib/terminalCommands';

export const useTerminal = () => {
  const [outputs, setOutputs] = useState<TerminalOutput[]>([]);
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentInput, setCurrentInput] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);

  const addOutput = useCallback((command: string, output: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newOutput: TerminalOutput = {
      id: Date.now().toString(),
      command,
      output,
      type,
      timestamp: new Date(),
    };
    setOutputs(prev => [...prev, newOutput]);
  }, []);

  const executeCommand = useCallback(async (command: string) => {
    if (!command.trim()) return;

    // Add to history
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);

    try {
      const result = await terminalCommands.execute(command, currentPath);
      
      if (result.newPath) {
        setCurrentPath(result.newPath);
      }
      
      addOutput(command, result.output, result.type);
    } catch (error) {
      addOutput(command, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }, [currentPath, addOutput]);

  const navigateHistory = useCallback((direction: 'up' | 'down') => {
    if (commandHistory.length === 0) return '';

    let newIndex: number;
    if (direction === 'up') {
      newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
    } else {
      newIndex = historyIndex === -1 ? -1 : Math.min(commandHistory.length - 1, historyIndex + 1);
    }

    setHistoryIndex(newIndex);
    return newIndex === -1 ? '' : commandHistory[newIndex];
  }, [commandHistory, historyIndex]);

  const getAutocompleteSuggestions = useCallback((input: string) => {
    return terminalCommands.getAutocompleteSuggestions(input, currentPath);
  }, [currentPath]);

  const clearTerminal = useCallback(() => {
    setOutputs([]);
  }, []);

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [outputs]);

  // Welcome message
  useEffect(() => {
    addOutput('', `CodeMate Terminal Emulator v1.0
Type 'help' to see available commands.
Current directory: ${currentPath}`, 'info');
  }, []);

  return {
    outputs,
    currentPath,
    executeCommand,
    navigateHistory,
    getAutocompleteSuggestions,
    clearTerminal,
    terminalRef,
    currentInput,
    setCurrentInput,
  };
};