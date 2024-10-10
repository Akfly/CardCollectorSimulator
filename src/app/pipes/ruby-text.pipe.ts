import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rubyText',
  standalone: true
})
export class RubyTextPipe implements PipeTransform {
  transform(value: string): string {
    const rubyRegex = /<([^>]+)>/g;
    let match;
    let result = '';
    let lastIndex = 0;

    while ((match = rubyRegex.exec(value)) !== null) {
      const rubyText = match[1];
      const startIndex = match.index - 1;
      const endIndex = rubyRegex.lastIndex;

      // Add the text before the ruby text
      result += value.slice(lastIndex, startIndex);

      // Add the character that will have ruby text
      const char = value[startIndex];
      result += `<ruby>${char}<rt>`;

      // Add the ruby text for each character
      for (let i = 0; i < rubyText.length; i++) {
        result += rubyText[i];
      }

      result += '</rt></ruby>';

      lastIndex = endIndex;
    }

    // Add the remaining text after the last ruby text
    result += value.slice(lastIndex);

    return result;
  }
}
