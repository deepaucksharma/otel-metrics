/**
 * @layer Data Provider
 * @summary TODO
 *
 * ## Purpose
 *
 * TODO
 *
 * ## Algorithm/Visual
 *
 * TODO
 *
 * @perfBudget TODO
 * @loc_estimate TODO
 */

/**
 * Validate a user-selected File object before any expensive I/O,
 * checking extension and size.
 */

/**
 * Describes why validation failed.
 */
export interface ValidationError {
  /** Error classification */
  code: 'INVALID_EXTENSION' | 'FILE_TOO_LARGE';
  /** Human-readable explanation. */
  message: string;
}

/**
 * File deemed safe to read.
 */
export interface ValidFile {
  /** Original File instance */
  file: File;
  /** True when the file name ends with '.gz'. */
  isGzipped: boolean;
}

/**
 * Discriminated union returned by {@link validateFile}.
 */
export type Either<L, R> =
  | { type: 'left'; value: L }
  | { type: 'right'; value: R };

const ALLOWED_EXTENSIONS = new Set(['json', 'gz', 'otel']);

/**
 * Validate file extension and byte size.
 *
 * @param file - Browser {@link File} object to validate.
 * @param maxBytes - Maximum allowed size in bytes. Defaults to 100 MiB.
 *
 * Returns Either of:
 *   - Supported extension and size within limit → `{ type: 'right', value: { file, isGzipped } }`
 *   - Unsupported extension → `{ type: 'left', value: { code: 'INVALID_EXTENSION', message } }`
 *   - File size exceeds limit → `{ type: 'left', value: { code: 'FILE_TOO_LARGE', message } }`
 */
export function validateFile(
  file: File,
  maxBytes = 100 * 1024 * 1024,
): Either<ValidationError, ValidFile> {
  const name = file.name.toLowerCase();
  const isGzipped = name.endsWith('.gz');
  const ext = name.split('.').pop() ?? '';

  if (!ALLOWED_EXTENSIONS.has(ext) && !isGzipped) {
    return {
      type: 'left',
      value: {
        code: 'INVALID_EXTENSION',
        message: `Unsupported file extension: ${ext}`,
      },
    };
  }

  if (file.size > maxBytes) {
    return {
      type: 'left',
      value: {
        code: 'FILE_TOO_LARGE',
        message: `File size ${file.size} bytes exceeds limit of ${maxBytes}`,
      },
    };
  }

  return {
    type: 'right',
    value: {
      file,
      isGzipped,
    },
  };
}
