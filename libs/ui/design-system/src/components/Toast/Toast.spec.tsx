import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import '@testing-library/jest-dom';
import { ToastProvider, useToast, toast } from './Toast';

describe('Toast', () => {
  describe('ToastProvider', () => {
    it('renders children without crashing', () => {
      render(
        <ToastProvider>
          <div>Test Child</div>
        </ToastProvider>
      );
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });
  });

  describe('useToast hook', () => {
    const TestComponent = () => {
      const { addToast } = useToast();

      return (
        <button onClick={() => addToast(toast.success('Test', 'Description'))}>
          Show Toast
        </button>
      );
    };

    it('allows adding toasts', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const button = screen.getByText('Show Toast');
      
      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument();
        expect(screen.getByText('Description')).toBeInTheDocument();
      });
    });
  });

  describe('toast helpers', () => {
    it('creates success toast', () => {
      const result = toast.success('Success', 'It worked');
      expect(result.variant).toBe('success');
      expect(result.title).toBe('Success');
      expect(result.description).toBe('It worked');
    });

    it('creates error toast', () => {
      const result = toast.error('Error', 'Something failed');
      expect(result.variant).toBe('error');
      expect(result.title).toBe('Error');
    });

    it('creates warning toast', () => {
      const result = toast.warning('Warning', 'Be careful');
      expect(result.variant).toBe('warning');
    });

    it('creates info toast', () => {
      const result = toast.info('Info', 'FYI');
      expect(result.variant).toBe('info');
    });
  });
});
