import debug from "debug";

// Setup debug namespaces
const debugSetup = debug("ai-prompt:setup");
const debugFileOps = debug("ai-prompt:file-operations");
const debugTransform = debug("ai-prompt:transform");
const debugError = debug("ai-prompt:error");

debugSetup("Initializing translation process");

// Adjusted to include debug statements throughout the provided code
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
const DEFAULT_MODEL = "gpt-3.5-turbo-0125";

let timesCalled = 0;

// Setup OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});
debugSetup("OpenAI API Key configured");

// Helper function to check if the path matches any exclude patterns
const shouldExclude = (path: string, excludePatterns?: string[]) => {
  // If exclude is undefined, do not exclude any paths
  if (!excludePatterns) return false;
  const result = excludePatterns.some((pattern) => path.includes(pattern));
  debugFileOps(`Checking exclusion for path: ${path}, result: ${result}`);
  return result;
};

// Helper function to check if the path matches any include patterns
const shouldInclude = (path: string, includePatterns?: string[]) => {
  // If include is undefined, include all paths
  if (!includePatterns) return true;
  const result = includePatterns.some((pattern) => path.includes(pattern));
  debugFileOps(`Checking inclusion for path: ${path}, result: ${result}`);
  return result;
};

// Helper function to copy files recursively
async function copyFilesRecursively({
  input: srcDir,
  output: destDir,
  limit = DEFAULT_LIMIT_PER_RUN,
  copyAll = false,
  exclude,
  include,
  prompt,
  overwrite,
  model,
}: any) {
  debugFileOps(`Starting recursive file copy from ${srcDir} to ${destDir}`);
  const entries = await fs.readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      debugFileOps(`Creating directory: ${destPath}`);
      await fs.mkdir(destPath, { recursive: true });
      await copyFilesRecursively({
        prompt,
        input: srcPath,
        output: destPath,
        copyAll,
        exclude,
        include,
        overwrite,
        model,
      });
    } else {
      // Check if destPath exists before proceeding
      if (!overwrite) {
        const destExists = await fs
          .access(destPath, fs.constants.F_OK)
          .then(() => true)
          .catch(() => false);

        if (destExists) {
          debugFileOps(`Destination path exists, skipping: ${destPath}`);
          continue; // Skip this iteration if destPath already exists
        }
      }

      const isExcluded = exclude ? shouldExclude(srcPath, exclude) : false;
      const isIncluded = include ? shouldInclude(srcPath, include) : true;

      if (!isExcluded && isIncluded) {
        if (entry.name.endsWith(".md")) {
          debugTransform(`Transforming markdown file: ${srcPath}`);
          const content = await fs.readFile(srcPath, "utf-8");
          timesCalled = timesCalled + 1;
          if (timesCalled > limit && limit > -1) {
            debugTransform(
              `Reached max API calls per run; not translating file ${srcPath}`
            );
            continue;
          }
          const transformedContent = await transformMarkdown(
            prompt,
            content,
            model
          );
          await fs.writeFile(destPath, transformedContent, "utf-8");
        } else if (copyAll) {
          debugFileOps(`Copying file: ${srcPath} to ${destPath}`);
          await fs.copyFile(srcPath, destPath);
        }
      }
    }
  }
}

// Stub for async transform on markdown files
async function transformMarkdown(
  prompt: string,
  content: string,
  model: string = DEFAULT_MODEL
): Promise<string> {
  debugTransform(`Transforming content with prompt: ${prompt}`);
  try {
    debugTransform("Sending request to OpenAI API");
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "user", content: prompt },
        { role: "user", content },
      ],
      max_tokens: MAX_TOKENS,
      seed: SEED,
    });
    debugTransform("Received response from OpenAI API");
    return response.choices[0].message.content ?? content;
  } catch (error) {
    debugError(`Error during transformation: ${error}`);
    return content; // Return original content on error
  }
}
yargs(hideBin(process.argv))
  .command(
    "$0 <config>",
    "Run the AI prompt script with the specified configuration",
    (yargs) => {
      yargs.positional("config", {
        describe: "The name of the YAML configuration file (without extension)",
        type: "string",
        demandOption: true,
      });
    }
  )
  .option("output", {
    alias: "o",
    describe: "The output directory",
    type: "string",
  })
  .option("copyAll", {
    alias: "a",
    describe: "Copy non-markdown files",
    type: "string",
  })
  .option("limit", {
    describe: "Number of files to process each time",
    type: "number",
  })
  .option("model", {
    describe: "Specify which OpenAI model to use",
    type: "string",
  })
  .option("overwrite", {
    describe: "Overwrite files in output path",
    type: "boolean",
  }) // Add include option
  .option("include", {
    describe: "CSV string of patterns to include",
    type: "string",
    coerce: (csv) => csv.split(",").map((item: any) => item.trim()), // Split the CSV string into an array of strings
  })
  // Add exclude option
  .option("exclude", {
    describe: "CSV string of patterns to exclude",
    type: "string",
    coerce: (csv) => csv.split(",").map((item: any) => item.trim()), // Split the CSV string into an array of strings
  })
  .help()
  .parseAsync()
  .then(async (argv) => {
    debugSetup(
      `Prompt invoked with script: ${argv.config} and output: ${argv.output}`
    );

    const filePath = path.join(__dirname, "ai", `${argv.config}.yaml`);

    try {
      debugFileOps(`Attempting to read configuration from: ${filePath}`);
      let fileContent = await fs.readFile(filePath, "utf-8");
      debugFileOps(`Loaded configuration from ${filePath}`);

      const parsedContent = yaml.parse(fileContent);

      // Override output directory if specified
      if (argv.output) {
        parsedContent.output = argv.output;
        debugFileOps(`Output directory overridden to: ${parsedContent.output}`);
      }
      const inputPath = path.resolve(__dirname, "..", parsedContent.input);
      const outputPath = path.resolve(__dirname, "..", parsedContent.output);

      debugFileOps(`Resolved input path: ${inputPath}`);
      debugFileOps(`Resolved output path: ${outputPath}`);
      await fs.mkdir(outputPath, { recursive: true });
      debugFileOps(`Output directory created at: ${outputPath}`);
      const options = {
        ...parsedContent,
      };
      debugFileOps(
        `copyFilesRecursively options:` + JSON.stringify(options, null, 2)
      );
      await copyFilesRecursively(options);
      debugFileOps("Completed file copy and transformation process");
    } catch (error) {
      console.error(`Error in process: ${error}`);
    }
  })
  .catch((error) => {
    console.error(`Failed to process: ${error}`);
  });
