import { FileSystemItem, ProcessInfo, SystemInfo } from '@/types/terminal';

class TerminalCommandSystem {
  private fileSystem: Map<string, FileSystemItem[]> = new Map();
  private processes: ProcessInfo[] = [];
  private systemInfo: SystemInfo;
  private commandHistory: string[] = [];

  constructor() {
    this.initializeFileSystem();
    this.initializeProcesses();
    this.initializeSystemInfo();
  }

  private initializeFileSystem() {
    // Initialize with sample directory structure
    this.fileSystem.set('/home/user', [
      { name: 'Documents', type: 'directory', modified: new Date(), permissions: 'drwxr-xr-x' },
      { name: 'Desktop', type: 'directory', modified: new Date(), permissions: 'drwxr-xr-x' },
      { name: 'Downloads', type: 'directory', modified: new Date(), permissions: 'drwxr-xr-x' },
      { name: 'README.txt', type: 'file', size: 1024, modified: new Date(), permissions: '-rw-r--r--' },
      { name: 'script.sh', type: 'file', size: 512, modified: new Date(), permissions: '-rwxr-xr-x' },
    ]);

    this.fileSystem.set('/home/user/Documents', [
      { name: 'project.txt', type: 'file', size: 2048, modified: new Date(), permissions: '-rw-r--r--' },
      { name: 'notes.md', type: 'file', size: 1536, modified: new Date(), permissions: '-rw-r--r--' },
    ]);

    this.fileSystem.set('/home/user/Desktop', []);
    this.fileSystem.set('/home/user/Downloads', [
      { name: 'installer.zip', type: 'file', size: 10240, modified: new Date(), permissions: '-rw-r--r--' },
    ]);

    this.fileSystem.set('/home', [
      { name: 'user', type: 'directory', modified: new Date(), permissions: 'drwxr-xr-x' },
    ]);

    this.fileSystem.set('/', [
      { name: 'home', type: 'directory', modified: new Date(), permissions: 'drwxr-xr-x' },
      { name: 'usr', type: 'directory', modified: new Date(), permissions: 'drwxr-xr-x' },
      { name: 'etc', type: 'directory', modified: new Date(), permissions: 'drwxr-xr-x' },
      { name: 'var', type: 'directory', modified: new Date(), permissions: 'drwxr-xr-x' },
    ]);
  }

  private initializeProcesses() {
    this.processes = [
      { pid: 1, name: 'init', cpu: 0.1, memory: 512, status: 'sleeping' },
      { pid: 123, name: 'terminal', cpu: 2.5, memory: 1024, status: 'running' },
      { pid: 456, name: 'browser', cpu: 15.2, memory: 8192, status: 'running' },
      { pid: 789, name: 'code-editor', cpu: 8.7, memory: 4096, status: 'running' },
      { pid: 1011, name: 'file-manager', cpu: 1.2, memory: 2048, status: 'sleeping' },
    ];
  }

  private initializeSystemInfo() {
    this.systemInfo = {
      cpu: {
        usage: Math.floor(Math.random() * 50) + 20, // 20-70%
        cores: 8,
        model: 'Intel Core i7-12700K'
      },
      memory: {
        total: 16384, // 16GB
        used: 8192,
        free: 8192,
        usage: 50
      },
      uptime: 86400 // 1 day in seconds
    };
  }

  private normalizePath(path: string): string {
    if (path.startsWith('/')) return path;
    return path;
  }

  private resolvePath(currentPath: string, targetPath: string): string {
    if (targetPath.startsWith('/')) {
      return targetPath;
    }

    if (targetPath === '..') {
      const parts = currentPath.split('/').filter(p => p);
      parts.pop();
      return '/' + parts.join('/') || '/';
    }

    if (targetPath === '.') {
      return currentPath;
    }

    return `${currentPath}/${targetPath}`.replace(/\/+/g, '/');
  }

  private formatFileSize(bytes: number): string {
    const units = ['B', 'K', 'M', 'G'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${Math.round(size * 10) / 10}${units[unitIndex]}`;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async execute(command: string, currentPath: string): Promise<{
    output: string;
    type: 'success' | 'error' | 'info';
    newPath?: string;
  }> {
    // Add to command history
    if (command.trim()) {
      this.commandHistory.push(command.trim());
      // Keep only last 100 commands
      if (this.commandHistory.length > 100) {
        this.commandHistory.shift();
      }
    }

    const [cmd, ...args] = command.trim().split(/\s+/);

    // Check for dangerous commands and prevent them
    if (this.isDangerousCommand(cmd, args)) {
      return { 
        output: `Command '${command}' is not permitted for security reasons.`, 
        type: 'error' 
      };
    }

    switch (cmd.toLowerCase()) {
      case 'ls':
        return this.ls(currentPath, args);
      case 'cd':
        return this.cd(currentPath, args[0] || '/home/user');
      case 'pwd':
        return { output: currentPath, type: 'info' };
      case 'mkdir':
        return this.mkdir(currentPath, args[0]);
      case 'rm':
        return this.rm(currentPath, args[0], args.includes('-r'));
      case 'ps':
        return this.ps();
      case 'cpu':
        return this.cpu();
      case 'mem':
        return this.mem();
      case 'history':
        return this.history();
      case 'help':
        return this.help();
      case 'clear':
        return { output: '', type: 'info' };
      case 'whoami':
        return { output: 'user', type: 'info' };
      case 'date':
        return { output: new Date().toString(), type: 'info' };
      case 'uptime':
        return this.uptime();
      case 'echo':
        return { output: args.join(' '), type: 'info' };
      case 'cat':
        return this.cat(currentPath, args[0]);
      case 'touch':
        return this.touch(currentPath, args[0]);
      case 'tree':
        return this.tree(currentPath);
      default:
        // Simulate subprocess fallback for other commands
        return this.simulateSubprocess(cmd, args);
    }
  }

  private ls(currentPath: string, args: string[]): { output: string; type: 'success' | 'error' | 'info' } {
    const items = this.fileSystem.get(currentPath) || [];
    const showLong = args.includes('-l');
    const showAll = args.includes('-a');

    let filteredItems = showAll ? items : items.filter(item => !item.name.startsWith('.'));

    if (filteredItems.length === 0) {
      return { output: '', type: 'info' };
    }

    if (showLong) {
      const output = filteredItems
        .map(item => {
          const size = item.type === 'file' ? this.formatFileSize(item.size || 0).padStart(8) : '     dir';
          const date = this.formatDate(item.modified);
          return `${item.permissions}  ${size}  ${date}  ${item.name}`;
        })
        .join('\n');
      return { output, type: 'success' };
    } else {
      const output = filteredItems.map(item => item.name).join('  ');
      return { output, type: 'success' };
    }
  }

  private cd(currentPath: string, targetPath: string): { 
    output: string; 
    type: 'success' | 'error' | 'info'; 
    newPath?: string; 
  } {
    const newPath = this.resolvePath(currentPath, targetPath);
    
    if (this.fileSystem.has(newPath)) {
      return { output: '', type: 'success', newPath };
    } else {
      return { output: `cd: ${targetPath}: No such file or directory`, type: 'error' };
    }
  }

  private mkdir(currentPath: string, dirName: string): { output: string; type: 'success' | 'error' | 'info' } {
    if (!dirName) {
      return { output: 'mkdir: missing operand', type: 'error' };
    }

    const items = this.fileSystem.get(currentPath) || [];
    
    if (items.some(item => item.name === dirName)) {
      return { output: `mkdir: cannot create directory '${dirName}': File exists`, type: 'error' };
    }

    const newDir: FileSystemItem = {
      name: dirName,
      type: 'directory',
      modified: new Date(),
      permissions: 'drwxr-xr-x'
    };

    items.push(newDir);
    this.fileSystem.set(currentPath, items);
    this.fileSystem.set(`${currentPath}/${dirName}`, []);

    return { output: '', type: 'success' };
  }

  private rm(currentPath: string, fileName: string, recursive: boolean): { 
    output: string; 
    type: 'success' | 'error' | 'info' 
  } {
    if (!fileName) {
      return { output: 'rm: missing operand', type: 'error' };
    }

    const items = this.fileSystem.get(currentPath) || [];
    const itemIndex = items.findIndex(item => item.name === fileName);

    if (itemIndex === -1) {
      return { output: `rm: cannot remove '${fileName}': No such file or directory`, type: 'error' };
    }

    const item = items[itemIndex];
    
    if (item.type === 'directory' && !recursive) {
      return { output: `rm: cannot remove '${fileName}': Is a directory`, type: 'error' };
    }

    items.splice(itemIndex, 1);
    this.fileSystem.set(currentPath, items);

    if (item.type === 'directory') {
      this.fileSystem.delete(`${currentPath}/${fileName}`);
    }

    return { output: '', type: 'success' };
  }

  private ps(): { output: string; type: 'success' | 'error' | 'info' } {
    const header = 'PID    NAME           CPU%   MEM(KB)  STATUS';
    const processLines = this.processes.map(proc => 
      `${proc.pid.toString().padEnd(6)} ${proc.name.padEnd(14)} ${proc.cpu.toFixed(1).padStart(5)}  ${proc.memory.toString().padStart(7)}  ${proc.status}`
    );

    return { output: [header, ...processLines].join('\n'), type: 'success' };
  }

  private cpu(): { output: string; type: 'success' | 'error' | 'info' } {
    // Simulate dynamic CPU usage
    this.systemInfo.cpu.usage = Math.floor(Math.random() * 50) + 20;
    
    const output = `CPU Information:
Model: ${this.systemInfo.cpu.model}
Cores: ${this.systemInfo.cpu.cores}
Current Usage: ${this.systemInfo.cpu.usage}%`;

    return { output, type: 'success' };
  }

  private mem(): { output: string; type: 'success' | 'error' | 'info' } {
    // Simulate dynamic memory usage
    this.systemInfo.memory.used = Math.floor(Math.random() * 4096) + 6144;
    this.systemInfo.memory.free = this.systemInfo.memory.total - this.systemInfo.memory.used;
    this.systemInfo.memory.usage = Math.round((this.systemInfo.memory.used / this.systemInfo.memory.total) * 100);

    const output = `Memory Information:
Total: ${this.formatFileSize(this.systemInfo.memory.total * 1024 * 1024)}
Used:  ${this.formatFileSize(this.systemInfo.memory.used * 1024 * 1024)} (${this.systemInfo.memory.usage}%)
Free:  ${this.formatFileSize(this.systemInfo.memory.free * 1024 * 1024)}`;

    return { output, type: 'success' };
  }

  private uptime(): { output: string; type: 'success' | 'error' | 'info' } {
    const days = Math.floor(this.systemInfo.uptime / 86400);
    const hours = Math.floor((this.systemInfo.uptime % 86400) / 3600);
    const minutes = Math.floor((this.systemInfo.uptime % 3600) / 60);

    const output = `up ${days} days, ${hours}:${minutes.toString().padStart(2, '0')}`;
    return { output, type: 'success' };
  }

  private isDangerousCommand(cmd: string, args: string[]): boolean {
    const dangerousPatterns = [
      /^rm.*-rf.*\/$/,  // rm -rf /
      /^rm.*\/$/,       // rm /
      /^dd.*\/dev\/.*/, // dd commands to devices
      /^format/,        // format commands
      /^fdisk/,         // disk partitioning
      /^mkfs/,          // filesystem creation
    ];

    const fullCommand = `${cmd} ${args.join(' ')}`;
    return dangerousPatterns.some(pattern => pattern.test(fullCommand));
  }

  private history(): { output: string; type: 'success' | 'error' | 'info' } {
    if (this.commandHistory.length === 0) {
      return { output: 'No commands in history.', type: 'info' };
    }

    const output = this.commandHistory
      .map((cmd, index) => `${(index + 1).toString().padStart(4)} ${cmd}`)
      .join('\n');

    return { output, type: 'info' };
  }

  private cat(currentPath: string, fileName: string): { output: string; type: 'success' | 'error' | 'info' } {
    if (!fileName) {
      return { output: 'cat: missing file operand', type: 'error' };
    }

    const items = this.fileSystem.get(currentPath) || [];
    const file = items.find(item => item.name === fileName && item.type === 'file');

    if (!file) {
      return { output: `cat: ${fileName}: No such file or directory`, type: 'error' };
    }

    // Simulate file content based on file name
    let content = '';
    switch (fileName.toLowerCase()) {
      case 'readme.txt':
        content = 'Welcome to CodeMate Terminal!\n\nThis is a simulated Linux terminal environment.\nType "help" to see available commands.';
        break;
      case 'script.sh':
        content = '#!/bin/bash\necho "Hello from CodeMate Terminal!"\ndate\nwhoami';
        break;
      case 'project.txt':
        content = 'CodeMate Hackathon Project\n========================\n\nTerminal Emulator Implementation\nFeatures: Command execution, file system, process monitoring';
        break;
      case 'notes.md':
        content = '# Terminal Notes\n\n## Commands Implemented\n- ls, cd, pwd\n- mkdir, rm\n- ps, cpu, mem\n- history, help';
        break;
      default:
        content = `This is the content of ${fileName}.\nGenerated by CodeMate Terminal.`;
    }

    return { output: content, type: 'info' };
  }

  private touch(currentPath: string, fileName: string): { output: string; type: 'success' | 'error' | 'info' } {
    if (!fileName) {
      return { output: 'touch: missing file operand', type: 'error' };
    }

    const items = this.fileSystem.get(currentPath) || [];
    
    if (items.some(item => item.name === fileName)) {
      // Update timestamp of existing file
      const item = items.find(item => item.name === fileName);
      if (item) {
        item.modified = new Date();
      }
      return { output: '', type: 'success' };
    }

    // Create new file
    const newFile: FileSystemItem = {
      name: fileName,
      type: 'file',
      size: 0,
      modified: new Date(),
      permissions: '-rw-r--r--'
    };

    items.push(newFile);
    this.fileSystem.set(currentPath, items);

    return { output: '', type: 'success' };
  }

  private tree(currentPath: string): { output: string; type: 'success' | 'error' | 'info' } {
    const buildTree = (path: string, prefix: string = ''): string[] => {
      const items = this.fileSystem.get(path) || [];
      const lines: string[] = [];
      
      items.forEach((item, index) => {
        const isLast = index === items.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        const icon = item.type === 'directory' ? '📁 ' : '📄 ';
        
        lines.push(`${prefix}${connector}${icon}${item.name}`);
        
        if (item.type === 'directory') {
          const newPrefix = prefix + (isLast ? '    ' : '│   ');
          const subPath = `${path}/${item.name}`.replace(/\/+/g, '/');
          lines.push(...buildTree(subPath, newPrefix));
        }
      });
      
      return lines;
    };

    const pathName = currentPath === '/' ? '/' : currentPath.split('/').pop() || '/';
    const tree = [`📁 ${pathName}`, ...buildTree(currentPath)];
    
    return { output: tree.join('\n'), type: 'info' };
  }

  private simulateSubprocess(cmd: string, args: string[]): { output: string; type: 'success' | 'error' | 'info' } {
    // Simulate common shell commands
    const fullCommand = `${cmd} ${args.join(' ')}`;
    
    switch (cmd.toLowerCase()) {
      case 'grep':
        return { output: `grep: simulated output for '${args.join(' ')}'`, type: 'info' };
      case 'find':
        return { output: './file1.txt\n./subdir/file2.txt', type: 'info' };
      case 'wc':
        return { output: '  42  168 1024 total', type: 'info' };
      case 'head':
        return { output: 'First 10 lines of file...', type: 'info' };
      case 'tail':
        return { output: 'Last 10 lines of file...', type: 'info' };
      case 'ping':
        if (args[0]) {
          return { output: `PING ${args[0]}: 56 data bytes\n64 bytes from ${args[0]}: icmp_seq=0 ttl=64 time=1.234ms`, type: 'info' };
        }
        return { output: 'ping: usage: ping destination', type: 'error' };
      default:
        return { 
          output: `Command '${cmd}' not found. Available: ls, cd, pwd, mkdir, rm, ps, cpu, mem, history, help, clear, whoami, date, uptime, echo, cat, touch, tree`, 
          type: 'error' 
        };
    }
  }

  private help(): { output: string; type: 'success' | 'error' | 'info' } {
    const commands = [
      'CodeMate Terminal - Available Commands:',
      '',
      'File System Operations:',
      '  ls [-l] [-a]     - list directory contents',
      '  cd <directory>   - change directory',
      '  pwd              - print working directory',
      '  mkdir <name>     - create directory',
      '  rm [-r] <name>   - remove file or directory',
      '  cat <file>       - display file contents',
      '  touch <file>     - create empty file or update timestamp',
      '  tree             - display directory tree',
      '',
      'System Monitoring:',
      '  ps               - list running processes',
      '  cpu              - show CPU information and usage',
      '  mem              - show memory usage statistics',
      '',
      'Command History:',
      '  history          - show command history',
      '  ↑/↓ arrows       - navigate command history',
      '',
      'Utilities:',
      '  help             - show this help message',
      '  clear            - clear terminal screen',
      '  whoami           - display current user',
      '  date             - show current date and time',
      '  uptime           - show system uptime',
      '  echo <text>      - display text',
      '',
      'Simulated Commands:',
      '  grep, find, wc, head, tail, ping',
      '',
      'Features:',
      '  • Tab completion for commands and files',
      '  • Command history navigation',
      '  • Real-time system monitoring',
      '  • Safe command execution (dangerous commands blocked)',
      '  • Natural language command parsing (coming soon)',
    ];

    return { output: commands.join('\n'), type: 'info' };
  }

  getAutocompleteSuggestions(input: string, currentPath: string): string[] {
    const commands = ['ls', 'cd', 'pwd', 'mkdir', 'rm', 'ps', 'cpu', 'mem', 'help', 'clear', 'whoami', 'date', 'uptime'];
    const [cmd, ...args] = input.split(/\s+/);

    if (args.length === 0) {
      return commands.filter(c => c.startsWith(cmd));
    }

    if (cmd === 'cd' || cmd === 'ls' || cmd === 'rm') {
      const items = this.fileSystem.get(currentPath) || [];
      const partial = args[args.length - 1];
      return items
        .filter(item => item.name.startsWith(partial))
        .map(item => item.name);
    }

    return [];
  }
}

export const terminalCommands = new TerminalCommandSystem();