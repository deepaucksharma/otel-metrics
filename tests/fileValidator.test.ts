import { describe, it, expect } from 'vitest';
import { validateFile } from '../src/data/fileValidator';

function makeFile(name: string, size = 0): File {
  return new File(['content'], name, { type: 'application/octet-stream', lastModified: 0, });
}

describe('fileValidator', () => {
  it('accepts supported extensions', () => {
    const file = makeFile('trace.json');
    const res = validateFile(file, 100);
    expect(res.type).toBe('right');
    if (res.type === 'right') {
      expect(res.value.file).toBe(file);
      expect(res.value.isGzipped).toBe(false);
    }
  });

  it('flags gzipped files', () => {
    const file = makeFile('metrics.json.gz');
    const res = validateFile(file, 100);
    expect(res.type).toBe('right');
    if (res.type === 'right') {
      expect(res.value.isGzipped).toBe(true);
    }
  });

  it('rejects invalid extension', () => {
    const file = makeFile('note.txt');
    const res = validateFile(file, 100);
    expect(res.type).toBe('left');
    if (res.type === 'left') {
      expect(res.value.code).toBe('INVALID_EXTENSION');
    }
  });

  it('rejects when file too large', () => {
    const file = makeFile('a.json', 200);
    const res = validateFile(file, 100);
    expect(res.type).toBe('left');
    if (res.type === 'left') {
      expect(res.value.code).toBe('FILE_TOO_LARGE');
    }
  });
});
