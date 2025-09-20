import { useState, useCallback, useRef, useEffect } from 'react';
import { TerminalOutput } from '@/types/terminal';
import { terminalCommands } from '@/lib/terminalCommands';
import { aiParser } from '@/lib/aiParser';

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

    // Parse natural language commands
    const parsedCommand = aiParser.parseCommand(command);
    const isNaturalLanguage = aiParser.isNaturalLanguage(command);
    
    // Add to history (original command)
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);

    try {
      // Show natural language interpretation if different
      if (isNaturalLanguage && parsedCommand !== command) {
        addOutput(command, `Interpreting as: ${parsedCommand}`, 'info');
      }

      const result = await terminalCommands.execute(parsedCommand, currentPath);
      
      if (result.newPath) {
        setCurrentPath(result.newPath);
      }
      
      // Only show command output if there's actual output
      if (result.output) {
        addOutput(isNaturalLanguage ? parsedCommand : command, result.output, result.type);
      }
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
    addOutput('', `🚀 CodeMate Terminal Emulator v2.0 - Hackathon Edition
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ Features:
• Full command execution (ls, cd, pwd, mkdir, rm, ps, cpu, mem)
• Natural language support: "create folder test" or "show files"
• Command history (↑/↓ arrows) and tab completion
• Real-time system monitoring
• Safe command execution with security checks

📍 Current directory: ${currentPath}
💡 Type 'help' for commands or try natural language!

Examples:
→ show files
→ create folder myproject  
→ go to Documents
→ show cpu usage`, 'info');
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