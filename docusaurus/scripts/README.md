# Scripts

## LLM Bulk Processor - ai.js

The LLM Processor script (ai.js)

Requires OPENAI_API_KEY to be set in your environment with a valid OpenAI Key

### Options

The following arguments are available for every script

```
Options:
      --version    Show version number                                 [boolean]
  -l, --language   The target language for translation (e.g., 'french')
                                                             [string] [required]
  -o, --output     The output directory                                 [string]
  -a, --copyAll    Copy non-markdown files                              [string]
      --limit      Number of files to process each time                 [number]
      --model      Specify which OpenAI model to use                    [string]
      --overwrite  Overwrite files in output path                      [boolean]
      --help       Show help                                           [boolean]
```

#### Available Scripts

### translate

Translates documents to language of choice in directory of choice.

`yarn ai translate -l=[language name] -out=[output dir]`

By default only a single file is processed. Once you are sure it is working as intended, you can use `--limit=-1 --copyAll` to process all files and also copy all non-markdown files. You should then have an entire functional translation that can be published.
