import React from 'react';
import { TerminalOutput as TerminalOutputType } from '@/types/terminal';

interface TerminalOutputProps {
  output: TerminalOutputType;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ output }) => {
  const getTextColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-terminal-error';
      case 'success':
        return 'text-terminal-success';
      default:
        return 'text-terminal-text';
    }
  };

  const formatOutput = (text: string) => {
    return text.split('\n').map((line, index) => (
      <div key={index} className="whitespace-pre-wrap">
        {line}
      </div>
    ));
  };

  return (
    <div className="mb-2">
      {output.command && (
        <div className="flex items-center mb-1">
          <span className="text-terminal-prompt terminal-glow font-semibold">user@codemate</span>
          <span className="text-terminal-text-dim mx-1">:</span>
          <span className="text-terminal-path font-medium">~{output.command.startsWith('/') ? '' : '/'}</span>
          <span className="text-terminal-prompt mx-1 font-bold">$</span>
          <span className="text-terminal-text font-mono">{output.command}</span>
        </div>
      )}
      {output.output && (
        <div className={`ml-0 ${getTextColor(output.type)} leading-relaxed`}>
          {formatOutput(output.output)}
        </div>
      )}
    </div>
  );
};