export function parseRegexToStrings(regex: string, selects: Array<string | undefined>, text: string): Array<Array<string>> {
  const results = new Array<Array<string>>();
  const lines = text.split('\n');
  const listRegex = new RegExp(regex, 'g');
  
  for (const line of lines) {
    const match = listRegex.exec(line);
    if (match) {
      const result = new Array<string>();
      for (const select of selects) {
        if (select) {
          if (select.toUpperCase() === 'FULL') {
            result.push(match[0] || '');
          } else if (/^\$\d+$/.test(select)) {
            const index = parseInt(select.substring(1));
            result.push(match[index] || '');
          } else {
            const item = match[0].match(new RegExp(select));
            if (item) {
              result.push(item.join(''));
            } else {
              result.push('');
            }
          }
        } else {
          result.push('');
        }
      }
      results.push(result);
    }
  }
  
  return results;
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function replaceAll(str: string, regex: string, replacement: string): string {
  return str.replaceAll(new RegExp(regex, 'g'), replacement);
}
