// Type augmentation for vitest-axe matchers
// This ensures toHaveNoViolations is recognized by TypeScript in tsc -b mode
import 'vitest'

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Assertion<T = unknown> {
    toHaveNoViolations(): void
  }
}
