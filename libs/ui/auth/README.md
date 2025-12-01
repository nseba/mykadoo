# Authentication UI Components (@mykadoo/ui-auth)

React authentication UI components for the Mykadoo platform with comprehensive form validation, OAuth integration, and accessibility features.

## Features

- **Login Form**: Email/password authentication with remember me
- **Registration Form**: User signup with password strength indicator
- **OAuth Buttons**: Google and Facebook social login
- **Forgot Password**: Password reset request form
- **Reset Password**: New password form with strength validation
- **Email Verification**: Email verification prompt with resend

## Installation

```bash
yarn add @mykadoo/ui-auth
```

### Peer Dependencies

```bash
yarn add react react-dom react-hook-form @hookform/resolvers zod
```

## Components

### LoginForm

Email and password login form with validation.

```tsx
import { LoginForm } from '@mykadoo/ui-auth';

function LoginPage() {
  const handleLogin = async (data: { email: string; password: string; rememberMe?: boolean }) => {
    // Call your authentication API
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // Handle response
  };

  return (
    <LoginForm
      onSubmit={handleLogin}
      onForgotPassword={() => navigate('/forgot-password')}
      onSignUp={() => navigate('/register')}
      isLoading={false}
      error={undefined}
    />
  );
}
```

**Props:**
- `onSubmit`: `(data: { email: string; password: string; rememberMe?: boolean }) => Promise<void>` - Login handler
- `onForgotPassword?`: `() => void` - Forgot password callback
- `onSignUp?`: `() => void` - Sign up navigation callback
- `isLoading?`: `boolean` - Loading state
- `error?`: `string` - Error message to display

### RegisterForm

User registration form with password strength indicator and terms acceptance.

```tsx
import { RegisterForm } from '@mykadoo/ui-auth';

function RegisterPage() {
  const handleRegister = async (data: { name?: string; email: string; password: string }) => {
    // Call your registration API
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // Handle response
  };

  return (
    <RegisterForm
      onSubmit={handleRegister}
      onSignIn={() => navigate('/login')}
      isLoading={false}
      error={undefined}
    />
  );
}
```

**Props:**
- `onSubmit`: `(data: { name?: string; email: string; password: string }) => Promise<void>` - Registration handler
- `onSignIn?`: `() => void` - Sign in navigation callback
- `isLoading?`: `boolean` - Loading state
- `error?`: `string` - Error message to display

**Features:**
- Password strength indicator (Weak/Medium/Strong)
- Real-time validation
- Terms and conditions acceptance
- Password confirmation
- Optional name field

### OAuthButtons

Google and Facebook OAuth login buttons.

```tsx
import { OAuthButtons } from '@mykadoo/ui-auth';

function LoginPage() {
  const handleGoogleLogin = async () => {
    window.location.href = '/api/auth/google';
  };

  const handleFacebookLogin = async () => {
    window.location.href = '/api/auth/facebook';
  };

  return (
    <div>
      <LoginForm {...props} />
      <OAuthButtons
        onGoogleLogin={handleGoogleLogin}
        onFacebookLogin={handleFacebookLogin}
        isLoading={false}
        showDivider={true}
      />
    </div>
  );
}
```

**Props:**
- `onGoogleLogin?`: `() => void` - Google login callback
- `onFacebookLogin?`: `() => void` - Facebook login callback
- `isLoading?`: `boolean` - Loading state
- `showDivider?`: `boolean` - Show "Or continue with" divider (default: true)

### ForgotPasswordForm

Password reset request form.

```tsx
import { ForgotPasswordForm } from '@mykadoo/ui-auth';

function ForgotPasswordPage() {
  const [successMessage, setSuccessMessage] = useState<string>();

  const handleRequestReset = async (data: { email: string }) => {
    const response = await fetch('/api/auth/password-reset/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setSuccessMessage('Check your email for a password reset link');
  };

  return (
    <ForgotPasswordForm
      onSubmit={handleRequestReset}
      onBackToLogin={() => navigate('/login')}
      isLoading={false}
      error={undefined}
      successMessage={successMessage}
    />
  );
}
```

**Props:**
- `onSubmit`: `(data: { email: string }) => Promise<void>` - Reset request handler
- `onBackToLogin?`: `() => void` - Back to login callback
- `isLoading?`: `boolean` - Loading state
- `error?`: `string` - Error message
- `successMessage?`: `string` - Success message to display

### ResetPasswordForm

New password form with strength indicator.

```tsx
import { ResetPasswordForm } from '@mykadoo/ui-auth';

function ResetPasswordPage() {
  const { token } = useParams();

  const handleResetPassword = async (data: {
    newPassword: string;
    confirmPassword: string;
    token: string;
  }) => {
    const response = await fetch('/api/auth/password-reset/reset', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // Handle response and navigate to login
  };

  return (
    <ResetPasswordForm
      token={token}
      onSubmit={handleResetPassword}
      onBackToLogin={() => navigate('/login')}
      isLoading={false}
      error={undefined}
    />
  );
}
```

**Props:**
- `token`: `string` - Reset token from URL
- `onSubmit`: `(data: { newPassword: string; confirmPassword: string; token: string }) => Promise<void>` - Reset handler
- `onBackToLogin?`: `() => void` - Back to login callback
- `isLoading?`: `boolean` - Loading state
- `error?`: `string` - Error message

### EmailVerificationPrompt

Email verification prompt with resend functionality.

```tsx
import { EmailVerificationPrompt } from '@mykadoo/ui-auth';

function VerificationPage() {
  const [successMessage, setSuccessMessage] = useState<string>();
  const userEmail = 'user@example.com'; // Get from auth context

  const handleResendVerification = async () => {
    const response = await fetch('/api/auth/email/resend', {
      method: 'POST',
      body: JSON.stringify({ email: userEmail }),
    });
    setSuccessMessage('Verification email sent!');
  };

  return (
    <EmailVerificationPrompt
      email={userEmail}
      onResendVerification={handleResendVerification}
      isLoading={false}
      successMessage={successMessage}
      error={undefined}
    />
  );
}
```

**Props:**
- `email`: `string` - User's email address
- `onResendVerification`: `() => Promise<void>` - Resend verification handler
- `isLoading?`: `boolean` - Loading state
- `successMessage?`: `string` - Success message
- `error?`: `string` - Error message

## Styling

All components are styled with **Tailwind CSS** using the Mykadoo design system:

- **Primary Color**: Coral #FF6B6B (`coral-500`, `coral-600`, `coral-700`)
- **Typography**: Clean, readable fonts with proper hierarchy
- **Spacing**: Consistent 8px grid system
- **Accessibility**: WCAG 2.1 AA compliant with proper contrast ratios

### Customization

To customize the styling, you can:

1. **Override Tailwind Classes**: Pass custom className props (when supported)
2. **Extend Tailwind Config**: Add the `coral` color palette to your `tailwind.config.js`
3. **CSS Variables**: Define custom CSS variables for colors

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        coral: {
          50: '#FFE5E5',
          100: '#FFD1D1',
          200: '#FFA3A3',
          300: '#FF7575',
          400: '#FF7070',
          500: '#FF6B6B',
          600: '#E65C5C',
          700: '#CC5252',
          800: '#B34747',
          900: '#993D3D',
        },
      },
    },
  },
};
```

## Validation

All forms use **Zod** for schema validation with the following rules:

### Email Validation
- Must be a valid email format
- Example: `user@example.com`

### Password Validation (Registration & Reset)
- Minimum 8 characters, maximum 128 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@$!%*?&)

### Password Strength Indicator
- **Weak** (0-2 criteria): Red indicator
- **Medium** (3-4 criteria): Yellow indicator
- **Strong** (5-6 criteria): Green indicator

## Accessibility

All components follow accessibility best practices:

- **Semantic HTML**: Proper use of form elements and labels
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Visible focus states
- **Error Messages**: Associated with form fields
- **Color Contrast**: WCAG AA compliant (4.5:1 minimum)

## Integration Example

Complete authentication flow:

```tsx
import {
  LoginForm,
  RegisterForm,
  OAuthButtons,
  ForgotPasswordForm,
  ResetPasswordForm,
  EmailVerificationPrompt,
} from '@mykadoo/ui-auth';

function AuthPages() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <div>
            <LoginForm {...loginProps} />
            <OAuthButtons {...oauthProps} />
          </div>
        }
      />
      <Route path="/register" element={<RegisterForm {...registerProps} />} />
      <Route path="/forgot-password" element={<ForgotPasswordForm {...forgotProps} />} />
      <Route path="/reset-password/:token" element={<ResetPasswordForm {...resetProps} />} />
      <Route path="/verify-email" element={<EmailVerificationPrompt {...verifyProps} />} />
    </Routes>
  );
}
```

## TypeScript Support

All components are fully typed with TypeScript:

```tsx
import type {
  LoginFormProps,
  RegisterFormProps,
  OAuthButtonsProps,
  ForgotPasswordFormProps,
  ResetPasswordFormProps,
  EmailVerificationPromptProps,
} from '@mykadoo/ui-auth';
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - Mykadoo Platform
