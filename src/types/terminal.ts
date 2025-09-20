export interface TerminalOutput {
  id: string;
  command: string;
  output: string;
  type: 'success' | 'error' | 'info';
  timestamp: Date;
}

export interface FileSystemItem {
  name: string;
  type: 'file' | 'directory';
  size?: number;
  modified: Date;
  permissions: string;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  status: string;
}

export interface SystemInfo {
  cpu: {
    usage: number;
    cores: number;
    model: string;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  uptime: number;
}