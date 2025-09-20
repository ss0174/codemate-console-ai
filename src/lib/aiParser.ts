/**
 * AI/NLP Parser for Natural Language Commands
 * Converts natural language input into terminal commands
 */

interface CommandMapping {
  patterns: RegExp[];
  command: string;
  priority: number;
}

class AICommandParser {
  private commandMappings: CommandMapping[] = [
    // File operations
    {
      patterns: [
        /create\s+(a\s+)?(folder|directory)\s+(.+)/i,
        /make\s+(a\s+)?(folder|directory)\s+(.+)/i,
        /mkdir\s+(.+)/i
      ],
      command: 'mkdir $3',
      priority: 1
    },
    {
      patterns: [
        /create\s+(a\s+)?file\s+(.+)/i,
        /make\s+(a\s+)?file\s+(.+)/i,
        /touch\s+(.+)/i
      ],
      command: 'touch $2',
      priority: 1
    },
    {
      patterns: [
        /delete\s+(file|folder|directory)\s+(.+)/i,
        /remove\s+(file|folder|directory)\s+(.+)/i,
        /rm\s+(.+)/i
      ],
      command: 'rm $2',
      priority: 1
    },
    {
      patterns: [
        /(show|list|display)\s+(files|contents?|directory)/i,
        /what'?s\s+in\s+(this\s+)?(folder|directory)/i,
        /ls/i
      ],
      command: 'ls',
      priority: 1
    },
    {
      patterns: [
        /(show|list)\s+(files|contents?)\s+details?/i,
        /(show|list)\s+detailed\s+(files|contents?)/i,
        /long\s+list/i
      ],
      command: 'ls -l',
      priority: 2
    },
    {
      patterns: [
        /go\s+to\s+(folder|directory)\s+(.+)/i,
        /change\s+to\s+(folder|directory)\s+(.+)/i,
        /navigate\s+to\s+(.+)/i,
        /cd\s+(.+)/i
      ],
      command: 'cd $2',
      priority: 1
    },
    {
      patterns: [
        /where\s+am\s+i/i,
        /(show|display|print)\s+(current\s+)?(path|directory|location)/i,
        /pwd/i
      ],
      command: 'pwd',
      priority: 1
    },
    {
      patterns: [
        /(show|display|read)\s+(file\s+)?contents?\s+of\s+(.+)/i,
        /(show|display|read)\s+(.+)\s+file/i,
        /cat\s+(.+)/i
      ],
      command: 'cat $3',
      priority: 1
    },

    // System monitoring
    {
      patterns: [
        /(show|display|list)\s+(running\s+)?processes/i,
        /what\s+processes\s+are\s+running/i,
        /ps/i
      ],
      command: 'ps',
      priority: 1
    },
    {
      patterns: [
        /(show|display|check)\s+cpu\s+(usage|info|information)/i,
        /how\s+much\s+cpu/i,
        /cpu\s+(status|info)/i
      ],
      command: 'cpu',
      priority: 1
    },
    {
      patterns: [
        /(show|display|check)\s+memory\s+(usage|info|information)/i,
        /how\s+much\s+(memory|ram)/i,
        /mem(ory)?\s+(status|info)/i
      ],
      command: 'mem',
      priority: 1
    },

    // Utilities
    {
      patterns: [
        /(show|display)\s+(command\s+)?history/i,
        /what\s+commands\s+did\s+i\s+run/i,
        /previous\s+commands/i
      ],
      command: 'history',
      priority: 1
    },
    {
      patterns: [
        /clear\s+(screen|terminal)/i,
        /clean\s+(screen|terminal)/i,
        /cls/i
      ],
      command: 'clear',
      priority: 1
    },
    {
      patterns: [
        /who\s+am\s+i/i,
        /(show|display)\s+(current\s+)?user/i,
        /what'?s\s+my\s+username/i
      ],
      command: 'whoami',
      priority: 1
    },
    {
      patterns: [
        /(show|display|what'?s)\s+(current\s+)?(date|time)/i,
        /what\s+time\s+is\s+it/i
      ],
      command: 'date',
      priority: 1
    },
    {
      patterns: [
        /(show|display)\s+(system\s+)?uptime/i,
        /how\s+long\s+has\s+(system|computer)\s+been\s+running/i
      ],
      command: 'uptime',
      priority: 1
    },
    {
      patterns: [
        /help/i,
        /(show|display)\s+(available\s+)?commands/i,
        /what\s+can\s+i\s+do/i
      ],
      command: 'help',
      priority: 1
    },

    // Echo and display
    {
      patterns: [
        /(say|print|echo|display)\s+(.+)/i,
        /output\s+(.+)/i
      ],
      command: 'echo $2',
      priority: 1
    },

    // Complex operations
    {
      patterns: [
        /create\s+(folder|directory)\s+(.+)\s+and\s+go\s+to\s+it/i,
        /make\s+(folder|directory)\s+(.+)\s+and\s+enter\s+it/i
      ],
      command: 'mkdir $2 && cd $2',
      priority: 2
    },
  ];

  /**
   * Parse natural language input and convert to terminal command
   */
  parseCommand(input: string): string {
    const trimmedInput = input.trim();
    
    // If it's already a valid command, return as-is
    if (this.isDirectCommand(trimmedInput)) {
      return trimmedInput;
    }

    // Try to match against natural language patterns
    const matches = this.commandMappings
      .map(mapping => ({
        mapping,
        match: this.findBestMatch(trimmedInput, mapping.patterns)
      }))
      .filter(item => item.match)
      .sort((a, b) => b.mapping.priority - a.mapping.priority);

    if (matches.length > 0) {
      const bestMatch = matches[0];
      return this.substituteParameters(
        bestMatch.mapping.command,
        bestMatch.match!
      );
    }

    // If no pattern matches, return original input
    return trimmedInput;
  }

  /**
   * Check if input is already a direct command
   */
  private isDirectCommand(input: string): boolean {
    const directCommands = [
      'ls', 'cd', 'pwd', 'mkdir', 'rm', 'ps', 'cpu', 'mem',
      'history', 'help', 'clear', 'whoami', 'date', 'uptime',
      'echo', 'cat', 'touch', 'tree', 'grep', 'find', 'wc',
      'head', 'tail', 'ping'
    ];

    const firstWord = input.split(' ')[0].toLowerCase();
    return directCommands.includes(firstWord);
  }

  /**
   * Find the best matching pattern
   */
  private findBestMatch(input: string, patterns: RegExp[]): RegExpMatchArray | null {
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        return match;
      }
    }
    return null;
  }

  /**
   * Substitute parameters from regex match into command template
   */
  private substituteParameters(template: string, match: RegExpMatchArray): string {
    let result = template;
    
    // Replace $1, $2, $3, etc. with captured groups
    for (let i = 1; i < match.length; i++) {
      if (match[i]) {
        result = result.replace(new RegExp(`\\$${i}`, 'g'), match[i].trim());
      }
    }

    // Clean up any remaining parameter placeholders
    result = result.replace(/\$\d+/g, '').trim();
    
    return result;
  }

  /**
   * Get suggestions for natural language input
   */
  getSuggestions(input: string): string[] {
    const suggestions: string[] = [];
    
    if (input.toLowerCase().includes('create') || input.toLowerCase().includes('make')) {
      suggestions.push(
        'create folder myproject',
        'create file index.html',
        'make directory docs'
      );
    }
    
    if (input.toLowerCase().includes('show') || input.toLowerCase().includes('display')) {
      suggestions.push(
        'show files',
        'show cpu usage',
        'show memory info',
        'display current directory'
      );
    }
    
    if (input.toLowerCase().includes('go') || input.toLowerCase().includes('navigate')) {
      suggestions.push(
        'go to folder Documents',
        'navigate to home directory'
      );
    }

    return suggestions.slice(0, 5); // Return max 5 suggestions
  }

  /**
   * Check if input looks like natural language
   */
  isNaturalLanguage(input: string): boolean {
    const naturalIndicators = [
      /\b(create|make|show|display|go\s+to|navigate|where|what|how|please)\b/i,
      /\b(folder|directory|file)\b/i,
      /\?(.*)/,
      /\s+(a|an|the)\s+/i,
      /\s+(and|or|then)\s+/i
    ];

    return naturalIndicators.some(pattern => pattern.test(input));
  }
}

export const aiParser = new AICommandParser();