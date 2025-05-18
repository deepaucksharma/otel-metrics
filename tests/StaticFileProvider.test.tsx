import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StaticFileProvider } from '../src/data/StaticFileProvider';
import { bus } from '../src/services/eventBus';
import * as workerModule from '../src/data/dispatchToWorker';
import * as fileValidator from '../src/data/fileValidator';
import * as fileReader from '../src/data/readFile';

// Mock the modules we depend on
vi.mock('../src/services/eventBus', () => ({
  bus: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

vi.mock('../src/data/dispatchToWorker', async () => {
  const actual = await vi.importActual('../src/data/dispatchToWorker');
  return {
    ...actual,
    dispatchToParserWorker: vi.fn(),
    cancelParserTask: vi.fn(),
  };
});

vi.mock('../src/data/fileValidator', () => ({
  validateFile: vi.fn(),
}));

vi.mock('../src/data/readFile', () => ({
  readFileContent: vi.fn(),
}));

vi.mock('@/hooks/useErrorHandler', () => ({
  useErrorHandler: () => vi.fn(),
}));

vi.mock('@/state/uiSlice', () => ({
  useUiSlice: () => vi.fn(),
}));

describe('StaticFileProvider', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock crypto.randomUUID
    globalThis.crypto = {
      ...globalThis.crypto,
      randomUUID: () => '123e4567-e89b-12d3-a456-426614174000',
    };

    // Setup mock for validateFile to return success by default
    vi.mocked(fileValidator.validateFile).mockReturnValue({
      type: 'right',
      value: {
        file: new File([''], 'test.json', { type: 'application/json' }),
        isGzipped: false,
      },
    });

    // Setup mock for readFileContent to return empty JSON by default
    vi.mocked(fileReader.readFileContent).mockResolvedValue('{}');

    // Setup mock for dispatchToParserWorker to return success by default
    vi.mocked(workerModule.dispatchToParserWorker).mockResolvedValue({
      type: 'parsedSnapshot',
      payload: {
        id: 'test-snapshot',
        fileName: 'test.json',
        // Add other required properties for ParsedSnapshot
      },
      taskId: '123',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders drop area with instructions', () => {
    render(<StaticFileProvider />);
    
    expect(screen.getByText('Drop snapshot files or click to browse')).toBeInTheDocument();
    expect(screen.getByText('Accepts OTLP JSON and gzipped JSON formats')).toBeInTheDocument();
  });

  it('handles file selection via input change', async () => {
    render(<StaticFileProvider />);
    
    const file = new File(['{}'], 'test.json', { type: 'application/json' });
    const input = screen.getByLabelText('File input');
    
    Object.defineProperty(input, 'files', {
      value: [file],
    });
    
    fireEvent.change(input);
    
    expect(bus.emit).toHaveBeenCalledWith('data.snapshot.load.start', expect.objectContaining({
      fileName: 'test.json',
      fileSize: expect.any(Number),
      taskId: expect.any(String),
    }));
    
    await waitFor(() => {
      expect(fileValidator.validateFile).toHaveBeenCalled();
      expect(fileReader.readFileContent).toHaveBeenCalled();
      expect(workerModule.dispatchToParserWorker).toHaveBeenCalled();
    });
  });

  it('handles file validation errors', async () => {
    // Mock validation failure
    vi.mocked(fileValidator.validateFile).mockReturnValue({
      type: 'left',
      value: new Error('File too large'),
    });
    
    render(<StaticFileProvider />);
    
    const file = new File(['{}'], 'test.json', { type: 'application/json' });
    const input = screen.getByLabelText('File input');
    
    Object.defineProperty(input, 'files', {
      value: [file],
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(bus.emit).toHaveBeenCalledWith('data.snapshot.error', expect.objectContaining({
        fileName: 'test.json',
        error: 'File too large',
        taskId: expect.any(String),
      }));
      
      // Ensure we didn't proceed with further processing
      expect(fileReader.readFileContent).not.toHaveBeenCalled();
      expect(workerModule.dispatchToParserWorker).not.toHaveBeenCalled();
    });
  });

  it('handles gzipped files when acceptGzip is false', async () => {
    // Mock gzipped file
    vi.mocked(fileValidator.validateFile).mockReturnValue({
      type: 'right',
      value: {
        file: new File([''], 'test.gz', { type: 'application/gzip' }),
        isGzipped: true,
      },
    });
    
    render(<StaticFileProvider acceptGzip={false} />);
    
    const file = new File(['{}'], 'test.gz', { type: 'application/gzip' });
    const input = screen.getByLabelText('File input');
    
    Object.defineProperty(input, 'files', {
      value: [file],
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(bus.emit).toHaveBeenCalledWith('data.snapshot.error', expect.objectContaining({
        fileName: 'test.gz',
        error: 'Gzip files are not accepted',
      }));
      
      // Ensure we didn't proceed with further processing
      expect(fileReader.readFileContent).not.toHaveBeenCalled();
      expect(workerModule.dispatchToParserWorker).not.toHaveBeenCalled();
    });
  });

  it('handles worker parsing errors', async () => {
    // Mock worker error
    vi.mocked(workerModule.dispatchToParserWorker).mockResolvedValue({
      type: 'parserError',
      payload: {
        snapshotId: 'test-snapshot',
        fileName: 'test.json',
        taskId: '123',
        message: 'Invalid OTLP format',
        detail: 'Stack trace details',
      },
    });
    
    render(<StaticFileProvider />);
    
    const file = new File(['{}'], 'test.json', { type: 'application/json' });
    const input = screen.getByLabelText('File input');
    
    Object.defineProperty(input, 'files', {
      value: [file],
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(bus.emit).toHaveBeenCalledWith('data.snapshot.error', expect.objectContaining({
        fileName: 'test.json',
        error: 'Invalid OTLP format',
        detail: 'Stack trace details',
      }));
    });
  });

  it('handles file reading errors', async () => {
    // Mock read error
    vi.mocked(fileReader.readFileContent).mockRejectedValue(new Error('Read error'));
    
    render(<StaticFileProvider />);
    
    const file = new File(['{}'], 'test.json', { type: 'application/json' });
    const input = screen.getByLabelText('File input');
    
    Object.defineProperty(input, 'files', {
      value: [file],
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(bus.emit).toHaveBeenCalledWith('data.snapshot.error', expect.objectContaining({
        fileName: 'test.json',
        error: 'Read error',
      }));
    });
  });

  it('cancels active tasks on unmount', async () => {
    const { unmount } = render(<StaticFileProvider />);
    
    const file = new File(['{}'], 'test.json', { type: 'application/json' });
    const input = screen.getByLabelText('File input');
    
    Object.defineProperty(input, 'files', {
      value: [file],
    });
    
    fireEvent.change(input);
    
    // Now mock dispatchToParserWorker to not resolve immediately to keep task active
    vi.mocked(workerModule.dispatchToParserWorker).mockImplementation(() => new Promise(() => {}));
    
    // Unmount the component
    unmount();
    
    expect(workerModule.cancelParserTask).toHaveBeenCalled();
  });

  it('sets up event handlers for drag and drop', () => {
    render(<StaticFileProvider />);
    
    const dropZone = screen.getByRole('button', { name: /drop snapshot files/i });
    
    // Test drag enter
    fireEvent.dragOver(dropZone);
    expect(dropZone).toHaveClass('dragActive');
    
    // Test drag leave
    fireEvent.dragLeave(dropZone);
    expect(dropZone).not.toHaveClass('dragActive');
  });
});