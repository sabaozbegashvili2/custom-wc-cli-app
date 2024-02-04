const flags = require('./flags');
const fs = require('fs').promises;

interface Content {
    path: string,
    content: Buffer
}

const readFileAsync = async (path: string): Promise<Content> => {
    try {
        const content = await fs.readFile(path);

        return {
            path,
            content
        };
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`Can't read file at ${path}: ${error.message}`);
        } else {
            // Handle cases where the error is not an Error object
            console.error(`An unexpected error occurred: ${error}`);
        }
        process.exit(1);
    }
}

const calculateNumberOfLines = (data: String): number => {
    let numberOfLines: number = 0;

    for (let i:number = 0; i < data.length; i++) {
        if (data[i] === '\n') numberOfLines++;
    }

    return numberOfLines;
}

// man wc tells that word is considered sequence of characters delimited by whitespace
const calculateNumberOfWords = (data: string): number => {
    let numberOfWords: number = 0;
    let isPreviousWhiteSpace: boolean = true;

    for (let i: number = 0; i < data.length; i++) {
        const isCurrentCharWhiteSpace =
            data[i] === ' ' || data[i] === '\n' || data[i] === '\t' || data[i] === '\r' || data[i] === '\f' || data[i] === '\v';

        if (!isCurrentCharWhiteSpace && isPreviousWhiteSpace) {
            numberOfWords++;
        }

        isPreviousWhiteSpace = isCurrentCharWhiteSpace;
    }

    return numberOfWords;
}

function calculateNumberOfChars(data: string): number {
    let count: number = 0;

    for (let i = 0; i < data.length; i++) {
        const charCode: number = data.charCodeAt(i);
        // Check if the current character is the start of a surrogate pair
        if (charCode >= 0xD800 && charCode <= 0xDBFF) {

            if (i + 1 < data.length) {
                const nextCharCode = data.charCodeAt(i + 1);
                // Check if the next character completes the surrogate pair
                if (nextCharCode >= 0xDC00 && nextCharCode <= 0xDFFF) {
                    i++; // Skip the next character as it's part of the current surrogate pair
                }
            }
        }

        count++;
    }

    return count;
}


const flagOperation = (flag: string, buffer: Buffer): number => {
    const data = buffer.toString();

    switch (flag) {
        case 'c':
            return Buffer.byteLength(buffer);
        case 'l':
            return calculateNumberOfLines(data);
        case 'w':
            return calculateNumberOfWords(data);
        case 'm':
            return calculateNumberOfChars(data);
        default:
            process.exit(1);
    }
}

const processFile = (buffer: Buffer, anyOptionProvided: boolean): number[] => {
    let info: number[] = [];

    if (anyOptionProvided) {
        for (const [flag, value] of Object.entries(flags)) {
            if (value) {
                info.push(flagOperation(flag, buffer));
            }
        }
    } else {
        const defaultFlags = Object.keys(flags);

        for (let i = 0; i < defaultFlags.length - 1; i++) {
            info.push(flagOperation(defaultFlags[i], buffer));
        }
    }

    return info;
}

const outputResults = async (filePaths: string[], anyOptionProvided: boolean): Promise<void> => {
    const dataReadResults: Content[] = await Promise.all(filePaths.map(path => readFileAsync(path)));

    dataReadResults.forEach(result => {
        let outputTxt: string = '';
        const output: number[] = processFile(result['content'],anyOptionProvided);

        output.forEach(piece => outputTxt += piece + ' ');
        const parts: string[] = result['path'].split('/');
        outputTxt += parts[parts.length - 1];
        console.log(outputTxt);
    });
}

const readStdin = async(stdin: NodeJS.ReadStream): Promise<Buffer> => {
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
        stdin.on('data', (chunk) => {
            chunks.push(chunk); // Accumulate data chunks
        });

        stdin.on('end', () => {
            const buffer = Buffer.concat(chunks); // Combine all chunks into a single buffer
            resolve(buffer); // Resolve the promise with the buffer
        });

        process.stdin.on('error', (err) => {
            reject(err); // Reject the promise if there's an error
        });
    });
}

const outputStdInResult = async (buffer: Buffer, anyOptionProvided: boolean): Promise<void> => {
    const output: number[] = processFile(buffer, anyOptionProvided);
    let outputTxt: string = '';
    output.forEach(piece => outputTxt += piece + ' ');
    console.log(outputTxt);
}

const printHelp = (): void => {
    console.log(`
Usage: my-wc [options] [file...]
Options:
  -l    Print the newline counts
  -w    Print the word counts
  -c    Print the byte counts
  -m    Print the character counts
  --help Show help information and usage

Note: If no file is specified, my-wc will read from standard input.
`);
};

const myWc = async (argv: string[], stdin: NodeJS.ReadStream): Promise<void> => {
    const args: string[] = argv.slice(2);
    let anyOptionProvided: boolean = false;
    let filePaths: string[] = [];

    if (args.includes('--help')) {
        printHelp();

        return;
    }

    args.forEach(arg => {
        if (arg.startsWith('-')) {
            if (!(arg[1] in flags)) {
               console.error('Invalid flag, please use --help to check available flags');

               process.exit(1);
            }

            flags[arg[1]] = true;
            anyOptionProvided = true;
        } else {
            filePaths.push(arg);
        }
    });

    if (!filePaths.length) {
        const buffer: Buffer = await readStdin(stdin);

        await outputStdInResult(buffer, anyOptionProvided);
    } else {
        await outputResults(filePaths, anyOptionProvided);
    }
}

module.exports = myWc;