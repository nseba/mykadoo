import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with proper conflict resolution.
 *
 * This function combines `clsx` for conditional class names and `tailwind-merge`
 * for resolving Tailwind class conflicts. Use this instead of template literals
 * or string concatenation when working with Tailwind classes.
 *
 * @param inputs - Class values to merge (strings, arrays, objects, etc.)
 * @returns Merged class string with conflicts resolved
 *
 * @example
 * ```tsx
 * // Basic usage
 * cn('px-4 py-2', 'bg-blue-500') // => 'px-4 py-2 bg-blue-500'
 *
 * // Conditional classes
 * cn('px-4', isActive && 'bg-blue-500') // => 'px-4 bg-blue-500' (if isActive is true)
 *
 * // Conflict resolution (later classes override earlier ones)
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4'
 *
 * // Object syntax
 * cn({
 *   'px-4': true,
 *   'py-2': true,
 *   'bg-blue-500': isActive,
 * })
 *
 * // Array syntax
 * cn(['px-4', 'py-2'], 'bg-blue-500')
 *
 * // Combining with component props
 * function Button({ className, variant }: ButtonProps) {
 *   return (
 *     <button className={cn(
 *       'px-4 py-2 rounded',
 *       variant === 'primary' && 'bg-blue-500 text-white',
 *       variant === 'secondary' && 'bg-gray-200 text-gray-900',
 *       className
 *     )}>
 *       Click me
 *     </button>
 *   );
 * }
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
