import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { promises as fs } from "fs";
import path from "path";
import yaml from "yaml";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const SEED = 1;
const MAX_TOKENS = 1024;
const DEFAULT_LIMIT_PER_RUN = 1;

let timesCalled = 0;

// Setup OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});

// Helper function to check if the path matches any exclude patterns
const shouldExclude = (path: string, excludePatterns?: string[]) => {
  // If exclude is undefined, do not exclude any paths
  if (!excludePatterns) return false;
  return excludePatterns.some((pattern) => path.includes(pattern));
};

// Helper function to check if the path matches any include patterns
const shouldInclude = (path: string, includePatterns?: string[]) => {
  // If include is undefined, include all paths
  if (!includePatterns) return true;
  return includePatterns.some((pattern) => path.includes(pattern));
};

// Helper function to copy files recursively
async function copyFilesRecursively({
  input: srcDir,
  output: destDir,
  limitPerRun = DEFAULT_LIMIT_PER_RUN,
  copyAll,
  exclude,
  include,
  prompt,
}: any) {
  const entries = await fs.readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      await fs.mkdir(destPath, { recursive: true });
      await copyFilesRecursively({
        prompt,
        input: srcPath,
        output: destPath,
      });
    } else {
      const isExcluded = exclude ? shouldExclude(srcPath, exclude) : false;
      const isIncluded = include ? shouldInclude(srcPath, include) : true; // Default to true if include is undefined

      // TODO: add option to not overwrite, so that this can be batched
      if (!isExcluded && isIncluded) {
        if (entry.name.endsWith(".md") && !shouldExclude(srcPath, exclude)) {
          // Apply async transform for .md files
          const content = await fs.readFile(srcPath, "utf-8");
          if (timesCalled++ > limitPerRun) {
            console.log("Reached max API calls per run");
            await fs.copyFile(srcPath, destPath);
            continue;
          }
          const transformedContent = await transformMarkdown(prompt, content);
          await fs.writeFile(destPath, transformedContent, "utf-8");
        } else if (copyAll) {
          await fs.copyFile(srcPath, destPath);
        }
      }
    }
  }
}

// Stub for async transform on markdown files
async function transformMarkdown(
  prompt: string,
  content: string
): Promise<string> {
  // Placeholder for actual transformation logic using OpenAI
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    messages: [
      { role: "system", content: prompt },
      { role: "user", content },
    ],
    max_tokens: MAX_TOKENS,
    seed: SEED,
  });
  return response.choices[0].message.content ?? content;
}

// Define the yargs command
yargs(hideBin(process.argv))
  .command(
    "$0 <prompt>",
    "Load a YAML file from the scripts/ai directory",
    (yargs) => {
      return yargs.positional("prompt", {
        describe: "The name of the YAML file to load (e.g., 'it' for it.yaml)",
        type: "string",
        demandOption: true,
      });
    },
    async (argv) => {
      const filePath = path.join(__dirname, "ai", `${argv.prompt}.yaml`);
      try {
        const fileContent = await fs.readFile(filePath, "utf-8");
        const parsedContent = yaml.parse(fileContent);
        const inputPath = path.resolve(__dirname, "..", parsedContent.input);
        const outputPath = path.resolve(__dirname, "..", parsedContent.output);

        await fs.mkdir(outputPath, { recursive: true });
        await copyFilesRecursively(parsedContent);

        console.log(`Files copied from ${inputPath} to ${outputPath}`);
      } catch (error) {
        if (error instanceof Error && "message" in error) {
          console.error(
            `Error processing YAML file or copying files: ${error.message}`
          );
        } else {
          console.error(error);
        }
      }
    }
  )
  .help().argv;
