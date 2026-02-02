/**
 * Unit Tests for UI Components
 * 
 * Tests the Button, Input, Modal, and Spinner components
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';

describe('Button Component', () => {
    it('renders with default props', () => {
        render(<Button>Click me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
    });

    it('applies primary variant styles', () => {
        render(<Button variant="primary">Primary</Button>);
        const button = screen.getByRole('button', { name: /primary/i });
        expect(button).toHaveClass('bg-emerald-600');
    });

    it('applies secondary variant styles', () => {
        render(<Button variant="secondary">Secondary</Button>);
        const button = screen.getByRole('button', { name: /secondary/i });
        expect(button).toHaveClass('bg-zinc-200');
    });

    it('applies ghost variant styles', () => {
        render(<Button variant="ghost">Ghost</Button>);
        const button = screen.getByRole('button', { name: /ghost/i });
        expect(button).toHaveClass('bg-transparent');
    });

    it('applies danger variant styles', () => {
        render(<Button variant="danger">Danger</Button>);
        const button = screen.getByRole('button', { name: /danger/i });
        expect(button).toHaveClass('bg-red-600');
    });

    it('handles different sizes', () => {
        const { rerender } = render(<Button size="sm">Small</Button>);
        expect(screen.getByRole('button')).toHaveClass('px-3');

        rerender(<Button size="md">Medium</Button>);
        expect(screen.getByRole('button')).toHaveClass('px-4');

        rerender(<Button size="lg">Large</Button>);
        expect(screen.getByRole('button')).toHaveClass('px-6');
    });

    it('handles disabled state', () => {
        render(<Button disabled>Disabled</Button>);
        const button = screen.getByRole('button', { name: /disabled/i });
        expect(button).toBeDisabled();
        expect(button).toHaveClass('disabled:opacity-50');
    });

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not fire click when disabled', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick} disabled>Click me</Button>);
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('renders with custom className', () => {
        render(<Button className="w-full">Full Width</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('w-full');
    });
});

describe('Input Component', () => {
    it('renders with default props', () => {
        render(<Input placeholder="Enter text" />);
        const input = screen.getByPlaceholderText('Enter text');
        expect(input).toBeInTheDocument();
    });

    it('renders with label', () => {
        render(<Input label="Email" id="email" />);
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('handles value changes', () => {
        const handleChange = vi.fn();
        render(<Input onChange={handleChange} />);
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'test' } });
        expect(handleChange).toHaveBeenCalled();
    });

    it('shows error state', () => {
        render(<Input error="This field is required" />);
        expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('handles different input types', () => {
        render(<Input type="password" placeholder="Password" />);
        const input = screen.getByPlaceholderText('Password');
        expect(input).toHaveAttribute('type', 'password');
    });

    it('renders disabled state', () => {
        render(<Input disabled placeholder="Disabled" />);
        const input = screen.getByPlaceholderText('Disabled');
        expect(input).toBeDisabled();
    });
});

describe('Modal Component', () => {
    it('renders when open', () => {
        render(
            <Modal isOpen={true} onClose={() => { }} title="Test Modal">
                <p>Modal content</p>
            </Modal>
        );
        expect(screen.getByText('Test Modal')).toBeInTheDocument();
        expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(
            <Modal isOpen={false} onClose={() => { }} title="Test Modal">
                <p>Modal content</p>
            </Modal>
        );
        expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const handleClose = vi.fn();
        render(
            <Modal isOpen={true} onClose={handleClose} title="Test Modal">
                <p>Modal content</p>
            </Modal>
        );
        const closeButton = screen.getByRole('button');
        fireEvent.click(closeButton);
        expect(handleClose).toHaveBeenCalledTimes(1);
    });
});

describe('Spinner Component', () => {
    it('renders with default size', () => {
        render(<Spinner />);
        const spinner = document.querySelector('[class*="animate-spin"]');
        expect(spinner).toBeInTheDocument();
    });

    it('renders with different sizes', () => {
        const { rerender } = render(<Spinner size="sm" />);
        let spinner = document.querySelector('[class*="animate-spin"]');
        expect(spinner).toHaveClass('w-4');

        rerender(<Spinner size="md" />);
        spinner = document.querySelector('[class*="animate-spin"]');
        expect(spinner).toHaveClass('w-6');

        rerender(<Spinner size="lg" />);
        spinner = document.querySelector('[class*="animate-spin"]');
        expect(spinner).toHaveClass('w-8');
    });
});
