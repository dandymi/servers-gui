import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ServerManager from './ServerManager';

// Mock FileReader
class MockFileReader {
  onload: null | ((this: FileReader, ev: ProgressEvent<FileReader>) => any);
  constructor() {
    this.onload = null;
  }
  readAsText(blob: Blob) {
    // Simulate async operation
    setTimeout(() => {
      if (this.onload) {
        // Create a mock event object with target.result
        const mockEvent = {
          target: {
            result: blob.text ? blob.text() : 'mock script content',
          },
        };
        // @ts-ignore
        this.onload.call(this, mockEvent);
      }
    }, 0);
  }
}

// Replace the global FileReader with our mock
global.FileReader = MockFileReader as unknown as typeof FileReader;

describe('ServerManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without servers', () => {
    render(<ServerManager />);
    expect(screen.queryByText(/no servers added yet/i)).toBeTruthy();
  });

  test('displays add server button', () => {
    render(<ServerManager />);
    expect(screen.queryByRole('button', { name: /add server/i })).toBeTruthy();
  });

  test('adds a server when a file is selected', async () => {
    render(<ServerManager />);
    const addButton = screen.queryByRole('button', { name: /add server/i }) as HTMLElement;
    expect(addButton).toBeTruthy();
    fireEvent.click(addButton);

    // Get the file input by testid
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    // Create a mock file
    const file = new File(['file content'], 'test-file.sh', { type: 'application/x-shellscript' });

    // Set the files property and trigger change
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    fireEvent.change(fileInput);

    // Wait for the FileReader to process and the state to update
    await waitFor(() => {
      expect(screen.queryByText(/test-file.sh/)).toBeTruthy();
    });

    // Check that the server is displayed with correct initial state
    expect(screen.queryByRole('button', { name: /start/i })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /stop/i })).toBeTruthy();
    // Check initial state: start enabled, stop disabled
    const startButton = screen.queryByRole('button', { name: /start/i }) as HTMLButtonElement;
    const stopButton = screen.queryByRole('button', { name: /stop/i }) as HTMLButtonElement;
    expect(startButton.disabled).toBe(false);
    expect(stopButton.disabled).toBe(true);
  });

  test('toggles server running state', async () => {
    render(<ServerManager />);
    const addButton = screen.queryByRole('button', { name: /add server/i }) as HTMLElement;
    expect(addButton).toBeTruthy();
    fireEvent.click(addButton);

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['file content'], 'test-file.sh', { type: 'application/x-shellscript' });
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.queryByText(/test-file.sh/)).toBeTruthy();
    });

    // Initial state: not running
    let startButton = screen.queryByRole('button', { name: /start/i }) as HTMLButtonElement;
    let stopButton = screen.queryByRole('button', { name: /stop/i }) as HTMLButtonElement;
    expect(startButton.disabled).toBe(false);
    expect(stopButton.disabled).toBe(true);

    // Click start
    fireEvent.click(startButton);
    startButton = screen.queryByRole('button', { name: /start/i }) as HTMLButtonElement;
    stopButton = screen.queryByRole('button', { name: /stop/i }) as HTMLButtonElement;
    expect(startButton.disabled).toBe(true);
    expect(stopButton.disabled).toBe(false);

    // Click stop
    fireEvent.click(stopButton);
    startButton = screen.queryByRole('button', { name: /start/i }) as HTMLButtonElement;
    stopButton = screen.queryByRole('button', { name: /stop/i }) as HTMLButtonElement;
    expect(startButton.disabled).toBe(false);
    expect(stopButton.disabled).toBe(true);
  });

  test('removes a server', async () => {
    render(<ServerManager />);
    const addButton = screen.queryByRole('button', { name: /add server/i }) as HTMLElement;
    expect(addButton).toBeTruthy();
    fireEvent.click(addButton);

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['file content'], 'test-file.sh', { type: 'application/x-shellscript' });
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.queryByText(/test-file.sh/)).toBeTruthy();
    });

    const removeButton = screen.queryByRole('button', { name: /remove/i }) as HTMLElement;
    expect(removeButton).toBeTruthy();
    fireEvent.click(removeButton);

    // Wait for the server to be removed
    await waitFor(() => {
      expect(screen.queryByText(/test-file.sh/)).toBeFalsy();
    });
    expect(screen.queryByText(/no servers added yet/i)).toBeTruthy();
  });
});