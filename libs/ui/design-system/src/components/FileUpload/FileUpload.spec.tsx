import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FileUpload } from './FileUpload';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('FileUpload', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<FileUpload />);
      expect(screen.getByText(/click to upload/i)).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<FileUpload label="Upload documents" />);
      expect(screen.getByText('Upload documents')).toBeInTheDocument();
    });

    it('renders with helper text', () => {
      render(<FileUpload helperText="Max file size: 10MB" />);
      expect(screen.getByText('Max file size: 10MB')).toBeInTheDocument();
    });

    it('renders upload icon', () => {
      const { container } = render(<FileUpload />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('shows "or drag and drop" text', () => {
      render(<FileUpload />);
      expect(screen.getByText(/or drag and drop/i)).toBeInTheDocument();
    });
  });

  describe('File selection', () => {
    it('handles single file selection', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      const { container } = render(<FileUpload onFilesChange={handleChange} />);
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      await user.upload(input, file);

      expect(handleChange).toHaveBeenCalled();
      expect(screen.getByText(/test\.pdf/)).toBeInTheDocument();
    });

    it('handles multiple file selection', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      const { container } = render(<FileUpload multiple onFilesChange={handleChange} />);
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      const files = [
        new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['content2'], 'file2.pdf', { type: 'application/pdf' }),
      ];
      await user.upload(input, files);

      expect(handleChange).toHaveBeenCalled();
      expect(screen.getByText(/file1\.pdf/)).toBeInTheDocument();
      expect(screen.getByText(/file2\.pdf/)).toBeInTheDocument();
    });

    it('displays file size for selected files', async () => {
      const user = userEvent.setup();

      const { container } = render(<FileUpload />);
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['x'.repeat(1024)], 'test.pdf', {
        type: 'application/pdf',
      });
      await user.upload(input, file);

      expect(screen.getByText(/1\.0 KB/)).toBeInTheDocument();
    });
  });

  describe('Drag and drop', () => {
    it('handles file drop', () => {
      const handleChange = jest.fn();

      const { container } = render(<FileUpload onFilesChange={handleChange} />);
      const dropZone = container.querySelector('label[class*="border-dashed"]') as HTMLLabelElement;

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const dataTransfer = {
        files: [file],
        items: [{ kind: 'file', type: 'application/pdf', getAsFile: () => file }],
        types: ['Files'],
      };

      fireEvent.drop(dropZone, { dataTransfer });

      expect(handleChange).toHaveBeenCalled();
      expect(screen.getByText(/test\.pdf/)).toBeInTheDocument();
    });

    it('shows hover state during drag over', () => {
      const { container } = render(<FileUpload />);
      const dropZone = container.querySelector('label[class*="border-dashed"]') as HTMLLabelElement;

      fireEvent.dragOver(dropZone);

      expect(dropZone).toHaveClass('bg-primary-50');
    });

    it('removes hover state on drag leave', () => {
      const { container } = render(<FileUpload />);
      const dropZone = container.querySelector('label[class*="border-dashed"]') as HTMLLabelElement;

      fireEvent.dragOver(dropZone);
      expect(dropZone).toHaveClass('bg-primary-50');

      fireEvent.dragLeave(dropZone);
      expect(dropZone).not.toHaveClass('bg-primary-50');
    });
  });

  describe('File validation', () => {
    it('respects accept attribute', () => {
      const { container } = render(<FileUpload accept="image/*" />);
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      expect(input).toHaveAttribute('accept', 'image/*');
    });

    it('shows maxSize in the upload area', () => {
      render(<FileUpload maxSize={1024 * 1024} />);
      expect(screen.getByText(/Maximum size:/)).toBeInTheDocument();
      expect(screen.getByText(/1\.0 MB/)).toBeInTheDocument();
    });

    it('shows accept types in the upload area', () => {
      render(<FileUpload accept=".pdf,.doc,.docx" />);
      expect(screen.getByText(/.pdf, .doc, .docx/)).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('applies default state styles', () => {
      const { container } = render(<FileUpload state="default" />);
      const dropZone = container.querySelector('label[class*="border-dashed"]') as HTMLLabelElement;
      expect(dropZone).toHaveClass('border-neutral-300');
    });

    it('applies error state styles', () => {
      const { container } = render(
        <FileUpload state="error" helperText="Please upload a file" />
      );
      const dropZone = container.querySelector('label[class*="border-dashed"]') as HTMLLabelElement;
      expect(dropZone).toHaveClass('border-error-500');

      const helperText = screen.getByText('Please upload a file');
      expect(helperText).toHaveClass('text-error-600');
    });

    it('handles disabled state', () => {
      const { container } = render(<FileUpload disabled />);
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toBeDisabled();

      const dropZone = input.closest('label');
      expect(dropZone).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('does not accept files when disabled', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      const { container } = render(<FileUpload disabled onFilesChange={handleChange} />);
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      // Should not trigger change
      await user.upload(input, file);
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <FileUpload label="Upload documents" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations (error state)', async () => {
      const { container } = render(
        <FileUpload
          label="Upload"
          state="error"
          helperText="File required"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('associates helper text with input', () => {
      const { container } = render(
        <FileUpload
          label="Documents"
          helperText="Upload PDF files"
          id="doc-upload"
        />
      );
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toHaveAttribute(
        'aria-describedby',
        'doc-upload-helper'
      );
    });

    it('sets aria-invalid on error state', () => {
      const { container } = render(<FileUpload state="error" />);
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('generates unique IDs when not provided', () => {
      const { container } = render(
        <>
          <FileUpload label="Upload 1" />
          <FileUpload label="Upload 2" />
        </>
      );

      const inputs = container.querySelectorAll('input[type="file"]');
      expect(inputs[0].id).toBeTruthy();
      expect(inputs[1].id).toBeTruthy();
      expect(inputs[0].id).not.toBe(inputs[1].id);
    });
  });

  describe('Custom styling', () => {
    it('applies custom wrapperClassName', () => {
      const { container } = render(
        <FileUpload wrapperClassName="custom-wrapper" />
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-wrapper');
    });
  });
});
