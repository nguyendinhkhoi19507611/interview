import { createInterface } from 'readline';

class InvalidInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidInputError';
  }
}

type ProcessOptions = {
  delayMs?: number;
  onProgress?: (progress: number, value: number) => void;
  signal?: AbortSignal;
};

async function processWithDelay(
  numbers: number[],
  options: ProcessOptions = {}
): Promise<void> {
  const { delayMs = 1000, onProgress, signal } = options;

  if (!Array.isArray(numbers)) {
    throw new InvalidInputError('Input must be an array');
  }
  if (!numbers.every((n) => typeof n === 'number' && !isNaN(n))) {
    throw new InvalidInputError('All elements in the array must be valid numbers');
  }

  if (numbers.length === 0) {
    return;
  }

  const delay = (ms: number) => {
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        signal?.removeEventListener('abort', onAbort);
        resolve();
      }, ms);
 
      const onAbort = () => {
        clearTimeout(timer);
        reject(new Error('Processing was cancelled.'));
      };

      if (signal) {
        signal.addEventListener('abort', onAbort);
      }
    });
  };

  for (let i = 0; i < numbers.length; i++) {
    if (signal?.aborted) {
      throw new Error('Processing was cancelled.');
    }
    await delay(delayMs);
    console.log(numbers[i]);

    if (onProgress) {
      onProgress(((i + 1) / numbers.length) * 100, numbers[i]);
    }
  }
}

async function main() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(query, (answer) => resolve(answer));
    });
  };

  try {
    const userNumbers = await question('Nhập dãy số, phân tách bằng dấu phẩy (VD: 1,2,3,4,5): ');
    const userDelay = await question('Nhập delay (ms) giữa các số (mặc định 1000): ');
    
    const controller = new AbortController();

    process.stdin.on('data', (data) => {
      const input = data.toString().trim().toLowerCase();
      if (input === 'c') {
        controller.abort();
        console.log('Đã hủy quá trình xử lý!');
      }
    });
 
    const numbersArray = userNumbers
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
      .map((v) => Number(v));

    const delayMs = userDelay.trim() !== '' ? Number(userDelay.trim()) : 1000;
  
    await processWithDelay(numbersArray, {
      delayMs,
      signal: controller.signal,
      onProgress: (progress, value) => {
        console.log(`Progress: ${progress.toFixed(0)}% - Processed: ${value}`);
      }
    });

    console.log('Hoàn tất xử lý!');
  } catch (error: any) {
    if (error instanceof InvalidInputError) {
      console.error('Lỗi đầu vào:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    rl.close();
  }
}

main();
