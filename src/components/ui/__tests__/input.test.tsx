import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { Input } from '../input';

describe('Input', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should render input with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should have correct default type', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input.type).toBe('text');
  });

  it('should support text type', () => {
    render(<Input type="text" />);
    const input = screen.getByRole('textbox');
    expect(input.type).toBe('text');
  });

  it('should support email type', () => {
    const { container } = render(<Input type="email" />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('should support password type', () => {
    const { container } = render(<Input type="password" />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('should support number type', () => {
    const { container } = render(<Input type="number" />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('type', 'number');
  });

  it('should support search type', () => {
    const { container } = render(<Input type="search" />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('type', 'search');
  });

  it('should support date type', () => {
    const { container } = render(<Input type="date" />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('type', 'date');
  });

  it('should support file type', () => {
    const { container } = render(<Input type="file" />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('type', 'file');
  });

  it('should handle controlled value', () => {
    render(<Input value="test value" onChange={() => {}} />);
    const input = screen.getByDisplayValue('test value');
    expect(input.value).toBe('test value');
  });

  it('should update value on change', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello');

    expect(handleChange).toHaveBeenCalled();
  });

  it('should support uncontrolled value with defaultValue', () => {
    render(<Input defaultValue="initial" />);
    const input = screen.getByDisplayValue('initial');
    expect(input.value).toBe('initial');
  });

  it('should support disabled prop', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should not accept input when disabled', async () => {
    const user = userEvent.setup();
    render(<Input disabled />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'text');

    expect(input).toHaveValue('');
  });

  it('should support readOnly prop', () => {
    render(<Input readOnly value="read-only" onChange={() => {}} />);
    const input = screen.getByDisplayValue('read-only');
    expect(input.readOnly).toBe(true);
  });

  it('should support required prop', () => {
    render(<Input required />);
    const input = screen.getByRole('textbox');
    expect(input.required).toBe(true);
  });

  it('should support className prop', () => {
    const { container } = render(<Input className="custom-class" />);
    const input = container.querySelector('input');
    expect(input?.className).toContain('custom-class');
  });

  it('should support aria attributes', () => {
    render(<Input aria-label="Username" />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('should support data attributes', () => {
    render(<Input data-testid="custom-input" />);
    expect(screen.getByTestId('custom-input')).toBeInTheDocument();
  });

  it('should render with placeholder text', () => {
    render(<Input placeholder="Enter your name" />);
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });

  it('should show placeholder when empty', async () => {
    const { container } = render(<Input placeholder="Search..." />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('placeholder', 'Search...');
  });

  it('should support min attribute', () => {
    const { container } = render(<Input type="number" min="0" />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('min', '0');
  });

  it('should support max attribute', () => {
    const { container } = render(<Input type="number" max="100" />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('max', '100');
  });

  it('should support step attribute', () => {
    const { container } = render(<Input type="number" step="0.5" />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('step', '0.5');
  });

  it('should support pattern attribute', () => {
    render(<Input type="text" pattern="[0-9]{3}-[0-9]{4}" />);
    const input = screen.getByRole('textbox');
    expect(input.pattern).toBe('[0-9]{3}-[0-9]{4}');
  });

  it('should handle focus event', async () => {
    const user = userEvent.setup();
    const handleFocus = vi.fn();

    render(<Input onFocus={handleFocus} />);

    const input = screen.getByRole('textbox');
    await user.click(input);

    expect(handleFocus).toHaveBeenCalled();
  });

  it('should handle blur event', async () => {
    const user = userEvent.setup();
    const handleBlur = vi.fn();

    render(<Input onBlur={handleBlur} />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.tab();

    expect(handleBlur).toHaveBeenCalled();
  });

  it('should forward ref to input element', () => {
    let inputReference: HTMLInputElement | null = null;
    render(
      <Input
        ref={(element) => {
          inputReference = element;
        }}
      />
    );

    expect(inputReference).toBeTruthy();
    expect(inputReference?.tagName).toBe('INPUT');
  });

  it('should accept text input', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello World');

    expect(handleChange).toHaveBeenCalled();
  });

  it('should accept special characters', async () => {
    const user = userEvent.setup();
    render(<Input />);

    const input = screen.getByRole('textbox');
    await user.type(input, '!@#$%^&*()');

    expect(input.value).toContain('!');
  });

  it('should handle multiple event handlers', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();

    render(
      <Input
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    );

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.type(input, 'test');
    await user.tab();

    expect(handleFocus).toHaveBeenCalled();
    expect(handleChange).toHaveBeenCalled();
    expect(handleBlur).toHaveBeenCalled();
  });

  it('should support autoComplete prop', () => {
    const { container } = render(<Input autoComplete="email" />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('autocomplete', 'email');
  });

  it('should handle keyboard input', async () => {
    const user = userEvent.setup();
    render(<Input />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'keyboard input');

    expect(input.value).toBe('keyboard input');
  });

  it('should handle Enter key', async () => {
    const user = userEvent.setup();
    const handleKeyDown = vi.fn();

    render(<Input onKeyDown={handleKeyDown} />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.keyboard('{Enter}');

    expect(handleKeyDown).toHaveBeenCalled();
  });
});
