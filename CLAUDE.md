# Window Cleaning Booking System - Development Guide

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Type checking
npm run typecheck

# Lint code
npm run lint

# Format code
npm run format
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── forms/          # Form input components (TypeScript)
│   ├── sections/       # Form section components (TypeScript)
│   ├── ui/            # UI components (buttons, progress, etc.)
│   └── common/        # Shared utility components
├── hooks/              # Custom React hooks
├── services/           # Business logic services (TypeScript)
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── contexts/           # React contexts (Theme, etc.)
└── styles/             # CSS and styling files
```

## 🛠 Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run unit tests with Vitest
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🔧 Technology Stack

- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.x (migrated from Create React App)
- **Styling**: TailwindCSS with dark mode support
- **State Management**: React hooks with optimized form state
- **Type Safety**: TypeScript with strict mode
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint + Prettier + Husky pre-commit hooks
- **Performance**: React.memo, code splitting, lazy loading

## 📝 Architecture Improvements Made

### Phase 1: Security & Code Quality
- ✅ Removed hardcoded database credentials
- ✅ Implemented structured logging system
- ✅ Added environment variable validation
- ✅ Secured debug endpoints
- ✅ Enhanced admin password security

### Phase 2: Dependencies & Configuration
- ✅ Updated all packages to latest secure versions
- ✅ Aligned React versions across applications
- ✅ Enhanced .gitignore patterns
- ✅ Enabled TypeScript strict mode

### Phase 3: Architecture Refactoring
- ✅ Split monolithic 1000+ line components into smaller, focused modules
- ✅ Created reusable form components (InputField, SelectField, TextareaField)
- ✅ Implemented service layer pattern (BookingService, EmailTemplateService, FormNavigationService)
- ✅ Established shared types and constants

### Phase 4: TypeScript Migration
- ✅ Converted core services to TypeScript
- ✅ Created comprehensive type definitions in `types/booking.d.ts`
- ✅ Migrated form components to TypeScript with proper interfaces
- ✅ Added type-safe environment configuration

### Phase 5: Vite Migration
- ✅ Migrated from Create React App to Vite for faster builds
- ✅ Updated build configuration and scripts
- ✅ Configured proper TypeScript + JSX handling
- ✅ Optimized bundle splitting and performance

### Phase 6: Performance Optimizations
- ✅ Added React.memo to prevent unnecessary re-renders
- ✅ Implemented code splitting with lazy loading
- ✅ Created optimized form state management hooks
- ✅ Added performance monitoring capabilities

### Phase 7: UI/UX Enhancements
- ✅ Implemented dark mode support with system preference detection
- ✅ Added micro-interactions and smooth animations
- ✅ Enhanced accessibility features with ARIA support
- ✅ Created reusable UI components (AnimatedButton, ProgressIndicator)

### Phase 8: Developer Experience
- ✅ Setup pre-commit hooks with Husky and lint-staged
- ✅ Configured Prettier for consistent code formatting
- ✅ Enhanced ESLint configuration
- ✅ Created comprehensive development documentation

## 🎨 Component Guidelines

### Form Components
All form components are TypeScript-enabled and include:
- Proper ARIA attributes for accessibility
- Error handling and validation feedback
- Consistent styling with Tailwind
- Performance optimization with React.memo

### UI Components
- Follow atomic design principles
- Include hover states and micro-interactions
- Support dark mode theming
- Implement proper loading and error states

## 🧪 Testing Strategy

- Unit tests for utility functions and hooks
- Component tests for form validation
- Integration tests for user workflows
- Accessibility tests using jest-axe

## 🔒 Security Best Practices

- Environment variables for sensitive data
- Input validation and sanitization
- XSS prevention in user inputs
- Secure API communication patterns

## 📱 Accessibility Features

- WCAG 2.1 AA compliance
- Screen reader support with proper ARIA labels
- Keyboard navigation throughout the application
- High contrast mode support
- Reduced motion preference detection

## 🚦 Performance Features

- Lazy loading of heavy components
- Optimized bundle splitting
- React.memo for component optimization
- Debounced form inputs to reduce API calls
- Progressive loading states

## 🌙 Theme System

The application includes a comprehensive theme system:
- Light mode (default)
- Dark mode with enhanced contrast
- System preference detection
- Persistent user preferences
- Smooth theme transitions

## 🔧 Environment Variables

Required environment variables (use VITE_ prefix for Vite):
- `VITE_EMAILJS_SERVICE_ID` - EmailJS service configuration
- `VITE_EMAILJS_TEMPLATE_ID` - Email template ID
- `VITE_EMAILJS_PUBLIC_KEY` - EmailJS public key
- `VITE_RECAPTCHA_SITE_KEY` - Google reCAPTCHA site key

## 📚 Development Resources

- [Vite Documentation](https://vitejs.dev/)
- [React TypeScript Handbook](https://react-typescript-cheatsheet.netlify.app/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🤝 Contributing

1. Follow the existing code style and conventions
2. Write tests for new features
3. Update documentation as needed
4. Use semantic commit messages
5. Ensure all pre-commit hooks pass

## 📈 Performance Monitoring

The application includes built-in performance monitoring:
- Component render time tracking
- Memory usage optimization
- Bundle size analysis
- Core Web Vitals monitoring

---

*This documentation is maintained as part of the ongoing development process.*