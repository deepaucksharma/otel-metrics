import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProgressPanel } from '../src/ui/molecules/ProgressPanel';
import { useUiSlice } from '../src/state/uiSlice';
import { useMetricsSlice } from '../src/state/metricsSlice';
import * as workerModule from '../src/data/dispatchToWorker';

// Mock Zustand stores
vi.mock('../src/state/uiSlice', () => ({
  useUiSlice: vi.fn(),
}));

vi.mock('../src/state/metricsSlice', () => ({
  useMetricsSlice: vi.fn(),
}));

vi.mock('../src/data/dispatchToWorker', async () => {
  const actual = await vi.importActual('../src/data/dispatchToWorker');
  return {
    ...actual,
    cancelParserTask: vi.fn(),
  };
});

describe('ProgressPanel', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Setup default mock for useUiSlice
    vi.mocked(useUiSlice).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({
          isProgressPanelOpen: true,
          closeProgressPanel: vi.fn(),
        } as any);
      }
      return {
        isProgressPanelOpen: true,
        closeProgressPanel: vi.fn(),
      };
    });
    
    // Setup default mock for useMetricsSlice
    vi.mocked(useMetricsSlice).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({
          loadingProgress: [
            {
              fileName: 'test1.json',
              taskId: 'task-1',
              progress: 50,
              stage: 'parsing',
              fileSize: 1024 * 1024, // 1MB
              startTime: Date.now() - 5000, // Started 5 seconds ago
            },
            {
              fileName: 'test2.json',
              taskId: 'task-2',
              progress: 75,
              stage: 'mapping',
              fileSize: 2 * 1024 * 1024, // 2MB
              startTime: Date.now() - 10000, // Started 10 seconds ago
            },
          ],
        } as any);
      }
      return {
        loadingProgress: [
          {
            fileName: 'test1.json',
            taskId: 'task-1',
            progress: 50,
            stage: 'parsing',
            fileSize: 1024 * 1024,
            startTime: Date.now() - 5000,
          },
          {
            fileName: 'test2.json',
            taskId: 'task-2',
            progress: 75,
            stage: 'mapping',
            fileSize: 2 * 1024 * 1024,
            startTime: Date.now() - 10000,
          },
        ],
      };
    });
  });
  
  it('renders progress items when panel is open', () => {
    render(<ProgressPanel />);
    
    // Check panel title and progress items
    expect(screen.getByText('Processing Files')).toBeInTheDocument();
    expect(screen.getByText('test1.json')).toBeInTheDocument();
    expect(screen.getByText('test2.json')).toBeInTheDocument();
    
    // Check progress percentages are displayed
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    
    // Check file sizes are displayed
    expect(screen.getByText('1.0 MB')).toBeInTheDocument();
    expect(screen.getByText('2.0 MB')).toBeInTheDocument();
  });
  
  it('does not render when panel is closed', () => {
    // Override the isProgressPanelOpen value for this test
    vi.mocked(useUiSlice).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({
          isProgressPanelOpen: false,
          closeProgressPanel: vi.fn(),
        } as any);
      }
      return {
        isProgressPanelOpen: false,
        closeProgressPanel: vi.fn(),
      };
    });
    
    const { container } = render(<ProgressPanel />);
    
    // Check that the panel is not rendered
    expect(container.firstChild).toBeNull();
  });
  
  it('allows canceling tasks', () => {
    const mockCloseProgressPanel = vi.fn();
    
    // Set up the mock to return our mock function
    vi.mocked(useUiSlice).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({
          isProgressPanelOpen: true,
          closeProgressPanel: mockCloseProgressPanel,
        } as any);
      }
      return {
        isProgressPanelOpen: true,
        closeProgressPanel: mockCloseProgressPanel,
      };
    });
    
    render(<ProgressPanel />);
    
    // Find and click the cancel buttons
    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButtons[0]);
    
    // Verify the cancel function was called with the right task ID
    expect(workerModule.cancelParserTask).toHaveBeenCalledWith('task-1');
  });
  
  it('displays appropriate stage labels', () => {
    render(<ProgressPanel />);
    
    // Check stage labels are displayed
    expect(screen.getByText(/parsing/i)).toBeInTheDocument();
    expect(screen.getByText(/mapping/i)).toBeInTheDocument();
  });
  
  it('can close the panel', () => {
    const mockCloseProgressPanel = vi.fn();
    
    // Set up the mock to return our mock function
    vi.mocked(useUiSlice).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({
          isProgressPanelOpen: true,
          closeProgressPanel: mockCloseProgressPanel,
        } as any);
      }
      return {
        isProgressPanelOpen: true,
        closeProgressPanel: mockCloseProgressPanel,
      };
    });
    
    render(<ProgressPanel />);
    
    // Find and click the close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    // Verify the close function was called
    expect(mockCloseProgressPanel).toHaveBeenCalled();
  });
  
  it('displays elapsed time', () => {
    const now = Date.now();
    
    // Override the loadingProgress to have fixed timestamps for testing
    vi.mocked(useMetricsSlice).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({
          loadingProgress: [
            {
              fileName: 'test1.json',
              taskId: 'task-1',
              progress: 50,
              stage: 'parsing',
              fileSize: 1024 * 1024,
              startTime: now - 30000, // 30 seconds ago
            },
          ],
        } as any);
      }
      return {
        loadingProgress: [
          {
            fileName: 'test1.json',
            taskId: 'task-1',
            progress: 50,
            stage: 'parsing',
            fileSize: 1024 * 1024,
            startTime: now - 30000,
          },
        ],
      };
    });
    
    render(<ProgressPanel />);
    
    // Check that elapsed time is displayed
    expect(screen.getByText(/30s/i)).toBeInTheDocument();
  });
});