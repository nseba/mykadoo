import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Checkbox } from './Checkbox';
import { RadioGroup } from './Radio';
import { Button } from './Button';

const meta: Meta = {
  title: 'Components/Forms/Showcase',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/**
 * Complete form example with all form components
 */
export const CompleteForm: Story = {
  render: () => (
    <form className="max-w-2xl space-y-6 p-6 bg-white rounded-lg border border-neutral-200">
      <div>
        <h2 className="text-2xl font-bold mb-2">Contact Form</h2>
        <p className="text-neutral-600">Fill out the form below to get in touch</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="First Name" placeholder="John" required />
        <Input label="Last Name" placeholder="Doe" required />
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        required
      />

      <Input
        label="Phone"
        type="tel"
        placeholder="+1 (555) 000-0000"
        leftIcon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 3h3l1 4-2 2c1 2 3 4 5 5l2-2 4 1v3a1 1 0 01-1 1A13 13 0 012 4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        }
      />

      <RadioGroup
        label="How did you hear about us?"
        options={[
          { value: 'search', label: 'Search Engine' },
          { value: 'social', label: 'Social Media' },
          { value: 'friend', label: 'Friend or Colleague' },
          { value: 'other', label: 'Other' },
        ]}
      />

      <Textarea
        label="Message"
        placeholder="Tell us how we can help..."
        rows={4}
        showCount
        maxLength={500}
      />

      <Checkbox
        label="Subscribe to newsletter"
        helperText="Get weekly updates about our products and services"
      />

      <Checkbox label="I agree to the terms and conditions" required />

      <div className="flex gap-3">
        <Button type="submit" variant="primary">
          Submit
        </Button>
        <Button type="button" variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  ),
};

/**
 * Form validation example
 */
export const ValidationExample: Story = {
  render: () => (
    <div className="max-w-lg space-y-6 p-6 bg-white rounded-lg border border-neutral-200">
      <h2 className="text-xl font-bold">Sign Up</h2>

      <Input
        label="Username"
        placeholder="Choose a username"
        state="success"
        helperText="Username is available!"
      />

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        state="error"
        helperText="This email is already registered"
      />

      <Input
        label="Password"
        type="password"
        placeholder="Create a password"
        helperText="Must be at least 8 characters"
      />

      <Checkbox
        label="I accept the terms and conditions"
        state="error"
        helperText="You must accept the terms to continue"
      />

      <Button variant="primary" className="w-full">
        Create Account
      </Button>
    </div>
  ),
};

/**
 * All form components showcase
 */
export const AllComponents: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Text Inputs</h3>
        <div className="space-y-4">
          <Input label="Text Input" placeholder="Enter text..." />
          <Input
            label="With Icon"
            placeholder="Search..."
            leftIcon={
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M11 11L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            }
          />
          <Textarea label="Textarea" placeholder="Enter longer text..." rows={3} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Checkboxes</h3>
        <div className="space-y-3">
          <Checkbox label="Option 1" />
          <Checkbox label="Option 2" helperText="With helper text" />
          <Checkbox label="Disabled" disabled />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Radio Buttons</h3>
        <RadioGroup
          label="Choose an option"
          options={[
            { value: '1', label: 'Option 1' },
            { value: '2', label: 'Option 2', helperText: 'With helper text' },
            { value: '3', label: 'Option 3' },
          ]}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Horizontal Radio</h3>
        <RadioGroup
          label="Size"
          orientation="horizontal"
          options={[
            { value: 's', label: 'Small' },
            { value: 'm', label: 'Medium' },
            { value: 'l', label: 'Large' },
          ]}
        />
      </div>
    </div>
  ),
};
