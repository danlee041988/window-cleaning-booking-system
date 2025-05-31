# TypeScript Migration Guide

## Overview
This guide outlines how to migrate the Somerset Window Cleaning booking form from JavaScript with PropTypes to TypeScript for enhanced type safety.

## Benefits of TypeScript

1. **Compile-time type checking** - Catch errors before runtime
2. **Better IDE support** - Autocomplete, refactoring, navigation
3. **Self-documenting code** - Types serve as inline documentation
4. **Easier refactoring** - Type system helps prevent breaking changes
5. **Better team collaboration** - Clear contracts between components

## Migration Strategy

### Phase 1: Setup (1 day)
```bash
# Install TypeScript dependencies
npm install --save-dev typescript @types/react @types/react-dom @types/node

# Initialize TypeScript config
npx tsc --init

# Rename App.js to App.tsx
# Start with leaf components first
```

### Phase 2: Type Definitions (2 days)
Create comprehensive type definitions:

```typescript
// types/booking.ts
export interface BookingFormData {
  // Property details
  propertyType: string;
  bedrooms: string;
  selectedFrequency: string;
  initialWindowPrice: number;
  selectedWindowService: WindowService | null;
  
  // Booking type flags
  isCustomQuote: boolean;
  isCommercial: boolean;
  isResidential: boolean;
  isGeneralEnquiry: boolean;
  
  // Property features
  hasConservatory: boolean;
  hasExtension: boolean;
  additionalServices: AdditionalServices;
  
  // Customer details
  customerName: string;
  email: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string;
  townCity: string;
  postcode: string;
  
  // Pricing
  conservatorySurcharge: number;
  extensionSurcharge: number;
  gutterClearingServicePrice: number;
  fasciaSoffitGutterServicePrice: number;
  windowCleaningDiscount: number;
  subTotalBeforeDiscount: number;
  grandTotal: number;
  
  // Booking details
  selectedDate: string | null;
  bookingNotes: string;
  recaptchaToken: string;
}

export interface WindowService {
  name: string;
  price: number;
  type: string;
  frequency: string;
}

export interface AdditionalServices {
  conservatoryRoof: boolean;
  fasciaSoffitGutter: boolean;
  gutterClearing: boolean;
}

export type ContactMethod = 'email' | 'phone' | 'text';

export interface ValidationError {
  field: string;
  message: string;
}
```

### Phase 3: Component Migration (3-5 days)

#### Example Component Migration:

**Before (JavaScript):**
```javascript
import PropTypes from 'prop-types';

const SimpleProgressBar = ({ currentStep, totalSteps = 3 }) => {
  const percentage = (currentStep / totalSteps) * 100;
  // ...
};

SimpleProgressBar.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number
};
```

**After (TypeScript):**
```typescript
interface SimpleProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

const SimpleProgressBar: React.FC<SimpleProgressBarProps> = ({ 
  currentStep, 
  totalSteps = 3 
}) => {
  const percentage = (currentStep / totalSteps) * 100;
  // ...
};
```

### Phase 4: Utility Functions (1 day)

Convert utilities to TypeScript:

```typescript
// utils/validation.ts
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateField(
  fieldName: keyof BookingFormData,
  value: any,
  formData: BookingFormData
): ValidationError | null {
  // Validation logic with proper types
}
```

### Phase 5: Testing & Cleanup (1 day)

1. Update test files to `.test.tsx`
2. Fix any type errors
3. Remove PropTypes imports
4. Update build configuration

## TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "exclude": ["node_modules", "build", "dist"]
}
```

## Common Patterns

### Form Event Handlers
```typescript
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // Handle submission
};
```

### Custom Hooks
```typescript
interface UseFormPersistenceReturn {
  clearSavedData: () => void;
}

export function useFormPersistence(
  formData: BookingFormData,
  setFormData: React.Dispatch<React.SetStateAction<BookingFormData>>,
  storageKey: string = 'somersetBookingForm'
): UseFormPersistenceReturn {
  // Implementation
}
```

### API Calls
```typescript
interface EmailJSResponse {
  status: number;
  text: string;
}

async function sendEmail(
  templateParams: Record<string, any>
): Promise<EmailJSResponse> {
  // Type-safe EmailJS integration
}
```

## Migration Checklist

- [ ] Install TypeScript and type definitions
- [ ] Create tsconfig.json
- [ ] Define core type interfaces
- [ ] Migrate utility functions
- [ ] Migrate common components
- [ ] Migrate form components
- [ ] Migrate main App component
- [ ] Update imports to use .tsx extensions
- [ ] Remove all PropTypes
- [ ] Fix type errors
- [ ] Update build scripts
- [ ] Test thoroughly

## Potential Issues & Solutions

### Issue 1: Third-party libraries without types
**Solution**: Install @types packages or create custom declarations

```typescript
// types/emailjs.d.ts
declare module '@emailjs/browser' {
  export function send(
    serviceId: string,
    templateId: string,
    params: Record<string, any>,
    userId: string
  ): Promise<EmailJSResponse>;
}
```

### Issue 2: Dynamic object keys
**Solution**: Use proper typing with keyof

```typescript
const updateFormField = <K extends keyof BookingFormData>(
  field: K,
  value: BookingFormData[K]
) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};
```

### Issue 3: Event handler types
**Solution**: Use React's built-in event types

```typescript
type InputChangeHandler = React.ChangeEventHandler<HTMLInputElement>;
type FormSubmitHandler = React.FormEventHandler<HTMLFormElement>;
```

## Benefits After Migration

1. **Catch ~15-20% more bugs** at compile time
2. **Reduce runtime errors** by 30-50%
3. **Improve developer productivity** by 20-30%
4. **Better code documentation** built-in
5. **Easier onboarding** for new developers

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Migrating from PropTypes](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/migration)
- [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) - Type definitions

## Estimated Timeline

- **Small team (1-2 devs)**: 1-2 weeks
- **With testing**: Additional 3-5 days
- **Training time**: 1 week for team unfamiliar with TypeScript

The investment in TypeScript migration will pay off through:
- Fewer production bugs
- Faster development cycles
- Better code maintainability
- Enhanced team confidence