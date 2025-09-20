import React, { useState, useRef, useEffect } from 'react';
import { useTerminal } from '@/hooks/useTerminal';
import { TerminalOutput } from './TerminalOutput';
import { TerminalInput } from './TerminalInput';

export const Terminal = () => {
  const {
    outputs,
    currentPath,
    executeCommand,
    navigateHistory,
    getAutocompleteSuggestions,
    clearTerminal,
    terminalRef,
  } = useTerminal();

  const handleCommand = async (command: string) => {
    if (command.toLowerCase() === 'clear') {
      clearTerminal();
      return;
    }
    await executeCommand(command);
  };

  return (
    <div className="h-screen bg-terminal-bg text-terminal-text terminal-font flex flex-col">
      {/* Terminal Header */}
      <div className="bg-terminal-surface border-b border-terminal-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-terminal-text-dim text-sm">CodeMate Terminal</span>
        </div>
        <div className="text-terminal-path text-sm">
          {currentPath}
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto terminal-scroll p-4 space-y-1"
      >
        {outputs.map((output) => (
          <TerminalOutput key={output.id} output={output} />
        ))}
        
        <TerminalInput
          currentPath={currentPath}
          onCommand={handleCommand}
          onNavigateHistory={navigateHistory}
          getAutocompleteSuggestions={getAutocompleteSuggestions}
        />
      </div>
    </div>
  );
};