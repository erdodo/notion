import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '../tabs';

describe('Tabs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render tabs container', () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    );
    expect(container.querySelector('[role="tablist"]')).toBeInTheDocument();
  });

  it('should render tab triggers', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
  });

  it('should render tab content', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content for Tab 1</TabsContent>
      </Tabs>
    );
    expect(screen.getByText('Content for Tab 1')).toBeInTheDocument();
  });

  it('should show default tab content', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('should show different default tab', () => {
    render(
      <Tabs defaultValue="tab2">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('should switch tabs on click', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    expect(screen.getByText('Content 1')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Tab 2' }));
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('should switch back to previous tab', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    await user.click(screen.getByRole('tab', { name: 'Tab 2' }));
    expect(screen.getByText('Content 2')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Tab 1' }));
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('should navigate with arrow keys', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>
    );

    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    tab1.focus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('should navigate backward with ArrowLeft', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="tab2">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>
    );

    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    tab2.focus();

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('should activate tab with Enter key', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    tab2.focus();

    await user.keyboard('{Enter}');
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('should activate tab with Space key', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    tab2.focus();

    await user.keyboard(' ');
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('should work as controlled component', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const { rerender } = render(
      <Tabs value="tab1" onValueChange={handleChange}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    await user.click(screen.getByRole('tab', { name: 'Tab 2' }));
    expect(handleChange).toHaveBeenCalledWith('tab2');

    rerender(
      <Tabs value="tab2" onValueChange={handleChange}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('should render multiple tab triggers', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Account</TabsTrigger>
          <TabsTrigger value="tab2">Password</TabsTrigger>
          <TabsTrigger value="tab3">Notifications</TabsTrigger>
          <TabsTrigger value="tab4">Privacy</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Account settings</TabsContent>
        <TabsContent value="tab2">Password settings</TabsContent>
        <TabsContent value="tab3">Notification settings</TabsContent>
        <TabsContent value="tab4">Privacy settings</TabsContent>
      </Tabs>
    );
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Privacy')).toBeInTheDocument();
  });

  it('should have tablist role', () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    );
    expect(container.querySelector('[role="tablist"]')).toBeInTheDocument();
  });

  it('should have tab role for triggers', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    expect(screen.getAllByRole('tab').length).toBe(2);
  });

  it('should have tabpanel role for content', () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    );
    expect(container.querySelector('[role="tabpanel"]')).toBeInTheDocument();
  });

  it('should mark active tab', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    expect(tab1).toHaveAttribute('aria-selected', 'true');
  });

  it('should update active state on tab switch', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });

    expect(tab1).toHaveAttribute('aria-selected', 'true');
    expect(tab2).toHaveAttribute('aria-selected', 'false');

    await user.click(tab2);
    expect(tab1).toHaveAttribute('aria-selected', 'false');
    expect(tab2).toHaveAttribute('aria-selected', 'true');
  });

  it('should render horizontal tabs by default', () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    expect(container.querySelector('[role="tablist"]')).toBeInTheDocument();
  });

  it('should render vertical tabs', () => {
    const { container } = render(
      <Tabs defaultValue="tab1" orientation="vertical">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    expect(container.querySelector('[role="tablist"]')).toBeInTheDocument();
  });

  it('should support className on Tabs', () => {
    const { container } = render(
      <Tabs defaultValue="tab1" className="custom-tabs">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    );
    const tabs = container.querySelector('[role="tablist"]')?.parentElement;
    expect(tabs?.className).toContain('custom-tabs');
  });

  it('should support data attributes', () => {
    render(
      <Tabs defaultValue="tab1" data-testid="custom-tabs">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    );
    expect(screen.getByTestId('custom-tabs')).toBeInTheDocument();
  });

  it('should work as settings tabs', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <div>Account settings content</div>
        </TabsContent>
        <TabsContent value="security">
          <div>Security settings content</div>
        </TabsContent>
        <TabsContent value="notifications">
          <div>Notification settings content</div>
        </TabsContent>
      </Tabs>
    );

    expect(screen.getByText('Account settings content')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Security' }));
    expect(screen.getByText('Security settings content')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Notifications' }));
    expect(
      screen.getByText('Notification settings content')
    ).toBeInTheDocument();
  });

  it('should work as documentation tabs', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="installation">
        <TabsList>
          <TabsTrigger value="installation">Installation</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        <TabsContent value="installation">
          <code>npm install package</code>
        </TabsContent>
        <TabsContent value="usage">
          <code>import Package from 'package'</code>
        </TabsContent>
        <TabsContent value="examples">
          <code>{`<Package />`}</code>
        </TabsContent>
      </Tabs>
    );

    expect(screen.getByText('npm install package')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Usage' }));
    expect(
      screen.getByText("import Package from 'package'")
    ).toBeInTheDocument();
  });

  it('should manage focus on tab switch', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    await user.click(tab2);
    expect(tab2).toHaveFocus();
  });

  it('should handle long tab names', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">
            Very Long Tab Name That Might Wrap
          </TabsTrigger>
          <TabsTrigger value="tab2">Another Long Tab Name</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    expect(
      screen.getByText('Very Long Tab Name That Might Wrap')
    ).toBeInTheDocument();
  });

  it('should handle empty tab content', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" />
      </Tabs>
    );
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  it('should forward ref to tabs element', () => {
    let reference: HTMLDivElement | null = null;
    const refCallback = (element: HTMLDivElement | null) => {
      reference = element;
    };
    render(
      <Tabs ref={refCallback} defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    );
    expect(reference).toBeInstanceOf(HTMLDivElement);
  });

  it('should handle disabled tab content rendering', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" disabled>
            Tab 1
          </TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    expect(tab1).toBeDisabled();
  });

  it('should handle single tab', () => {
    render(
      <Tabs defaultValue="only">
        <TabsList>
          <TabsTrigger value="only">Only Tab</TabsTrigger>
        </TabsList>
        <TabsContent value="only">Only Content</TabsContent>
      </Tabs>
    );
    expect(screen.getByText('Only Content')).toBeInTheDocument();
  });

  it('should handle many tabs', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          {Array.from({ length: 10 }, (_, index) => (
            <TabsTrigger key={index} value={`tab${index + 1}`}>
              Tab {index + 1}
            </TabsTrigger>
          ))}
        </TabsList>
        {Array.from({ length: 10 }, (_, index) => (
          <TabsContent key={index} value={`tab${index + 1}`}>
            Content {index + 1}
          </TabsContent>
        ))}
      </Tabs>
    );
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 10')).toBeInTheDocument();
  });

  it('should have proper ARIA attributes', () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    );
    expect(container.querySelector('[role="tablist"]')).toBeInTheDocument();
    expect(screen.getByRole('tab')).toBeInTheDocument();
    expect(container.querySelector('[role="tabpanel"]')).toBeInTheDocument();
  });
});
