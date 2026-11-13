# Interactive demos

One folder per interactive demo, named after the id used in pages (`<InteractiveDemo id="content-manager" />`):

- `description.md`: the tour in plain text (optional)
- `scenario.yaml`: the steps, their target and their text
- `setup.js`: resets the demo app before a capture (optional)
- `generated-capture.json`: written by the capture script, never edited by hand

The screenshots are in `docusaurus/static/img/assets/interactive-demos/<id>/`. How to write, capture and update a demo: [`claude-plugins/inki/skills/inki-interactive-demo/README.md`](../../claude-plugins/inki/skills/inki-interactive-demo/README.md).
