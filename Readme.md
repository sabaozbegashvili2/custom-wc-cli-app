# My-WC CLI Tool

A custom implementation of the classic Unix `wc` (word count) command written in TypeScript. This tool provides functionalities to count bytes, words, characters, and lines in text files, with support for reading from both files and standard input.

## Getting Started

### Prerequisites

Ensure you have Node.js installed on your system. This project also requires TypeScript and `ts-node` for compilation and execution.

### Installation

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Install the dependencies:

```bash
npm install
```

1. Compile TypeScript to JavaScript:
```bash
npx tsc
```

## Running the Tool
```bash
npx npx my-wc [options] [file...]
```

```shell
Available Options
-l: Print the newline counts.
-w: Print the word counts.
-c: Print the byte counts.
-m: Print the character counts.
--help: Show help information and usage.
If no file is specified, my-wc will read from standard input.
```

## Concepts

### UTF-8 and Character Encoding
UTF-8 Encoding: UTF-8 is a variable-width character encoding used for electronic communication. It encodes characters using one to four bytes, making it efficient for both ASCII characters (which use a single byte) and a broad range of symbols and characters from various languages and scripts.

Multi-byte Characters: In UTF-8, characters outside the basic ASCII set are represented using multiple bytes. This includes many characters used in non-English languages, special symbols, and emojis. Understanding multi-byte characters is essential for correctly processing text data to ensure accurate character counts and text manipulation.

JavaScript and UTF-16: JavaScript uses UTF-16 encoding for strings internally. This means each character in a JavaScript string is typically 16 bits (2 bytes) long. For characters outside the Basic Multilingual Plane (BMP), JavaScript uses a pair of 16-bit values, known as surrogate pairs, to represent a single character.

These concepts are fundamental when building tools that handle text processing, ensuring compatibility across different languages and correct data handling.