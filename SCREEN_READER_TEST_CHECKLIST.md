# Screen Reader Testing Checklist

## Testing Setup
- **Windows**: NVDA (free) or JAWS
- **macOS**: VoiceOver (built-in - Cmd+F5)
- **Mobile**: iOS VoiceOver or Android TalkBack

## Key Navigation Commands
### VoiceOver (macOS)
- **Enable/Disable**: Cmd + F5
- **Navigate**: Control + Option + Arrow keys
- **Interact with element**: Control + Option + Space
- **Read all**: Control + Option + A
- **Navigate forms**: Control + Option + Cmd + J

### NVDA (Windows)
- **Enable/Disable**: Ctrl + Alt + N
- **Navigate**: Arrow keys
- **Forms mode**: NVDA + Space
- **Read all**: NVDA + Down Arrow

## Testing Checklist

### 1. Initial Page Load
- [ ] Page title is announced ("Somerset Window Cleaning Booking Form")
- [ ] Skip to content link is accessible and works
- [ ] Form purpose is clear from initial announcement

### 2. Progress Bar Navigation
- [ ] Current step is announced (e.g., "Step 1 of 3")
- [ ] Progress updates are announced when moving between steps

### 3. Step 1: Service Selection
- [ ] Property type dropdown is labeled and options are readable
- [ ] Bedroom count selection is accessible
- [ ] Frequency options are clearly announced with prices
- [ ] Selected values are confirmed by screen reader

### 4. Step 2: Additional Services
- [ ] Checkboxes are properly labeled
- [ ] Price changes are announced
- [ ] Service descriptions are readable

### 5. Step 3: Contact Details
- [ ] All form fields have proper labels
- [ ] Required fields are announced
- [ ] Validation errors are announced immediately
- [ ] Success messages are announced
- [ ] Field hints/help text is accessible

### 6. Form Validation
- [ ] Error messages are announced when they appear
- [ ] Error count is provided
- [ ] User can navigate directly to fields with errors
- [ ] Success states are announced

### 7. ReCAPTCHA
- [ ] Alternative audio challenge is available
- [ ] Instructions are clear

### 8. Form Submission
- [ ] Loading state is announced
- [ ] Success/failure is clearly announced
- [ ] Next steps are communicated

### 9. General Navigation
- [ ] Tab order is logical
- [ ] All interactive elements are reachable
- [ ] Focus indicators are visible
- [ ] No keyboard traps exist
- [ ] Form can be completed using only keyboard

### 10. Dynamic Content
- [ ] Price updates are announced
- [ ] Form state changes are communicated
- [ ] Loading states are announced

## Common Issues to Check

1. **Missing Labels**
   - Every input should announce its purpose
   - Placeholder text alone is not sufficient

2. **Dynamic Updates**
   - Price changes should be announced
   - Validation messages should interrupt politely

3. **Context**
   - User should know where they are in the form
   - Related information should be grouped

4. **Error Recovery**
   - Clear instructions for fixing errors
   - Easy navigation to problematic fields

## Testing Script

1. Start at the beginning of the form
2. Navigate through each field using only keyboard
3. Intentionally trigger validation errors
4. Correct errors and verify announcements
5. Complete entire form submission
6. Verify confirmation message

## Accessibility Features Implemented

✅ **ARIA Labels**: All form inputs have proper aria-label attributes
✅ **ARIA Live Regions**: Dynamic content updates are announced
✅ **Skip Links**: Quick navigation to main content
✅ **Focus Management**: Clear focus indicators and logical tab order
✅ **Error Handling**: Validation errors use role="alert"
✅ **Semantic HTML**: Proper heading structure and form elements
✅ **Screen Reader Only Content**: Important context provided via .sr-only class

## Known Limitations

1. ReCAPTCHA accessibility depends on Google's implementation
2. Complex pricing calculations may need additional context
3. Mobile screen readers may have different behaviors

## Recommended Testing Flow

1. **First Pass**: Navigate through entire form without entering data
2. **Second Pass**: Fill out form with valid data
3. **Third Pass**: Intentionally trigger all validation errors
4. **Fourth Pass**: Test on mobile device

## Success Criteria

- [ ] Form can be completed without visual reference
- [ ] All information needed is available to screen reader
- [ ] No confusion about current location or next steps
- [ ] Errors are clear and actionable
- [ ] Submission process is understandable

## Additional Resources

- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [NVDA Download](https://www.nvaccess.org/download/)
- [VoiceOver Guide](https://support.apple.com/guide/voiceover/welcome/mac)