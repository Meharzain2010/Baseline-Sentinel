# Baseline Sentinel
![Thumbnail](https://github.com/user-attachments/assets/d3fa60c9-33a4-457d-a01d-f6658300855b)

A VS Code extension to check for web features compatibility and provide quick fixes for baseline compatibility issues.

## Features

- **Real-time scanning**: Automatically scans JavaScript, TypeScript, JSX, and TSX files for baseline compatibility issues
- **Quick fixes**: Provides one-click fixes for common baseline compatibility problems
- **Dashboard view**: Visual dashboard showing compatibility status across your workspace
- **Customizable rules**: Easy-to-configure rules for different compatibility requirements

## Requirements

- VS Code 1.89.0 or higher
- Node.js (for development)

## Extension Settings

This extension contributes the following settings:

* `baseline-sentinel.enable`: Enable/disable the extension
* `baseline-sentinel.scanOnOpen`: Automatically scan files when opened
* `baseline-sentinel.scanOnChange`: Scan files when they are modified

## Commands

* `Baseline Sentinel: Scan Current File` - Manually scan the currently active file
* `Baseline Sentinel: Scan Workspace` - Scan all files in the workspace

## How to Use

1. Open a JavaScript, TypeScript, JSX, or TSX file
2. The extension will automatically scan for baseline compatibility issues
3. Issues will be highlighted with warnings in the editor
4. Click on the lightbulb icon or use Ctrl+. to see available quick fixes
5. Use the Baseline Sentinel dashboard in the activity bar to see an overview

## Development

To run this extension in development mode:

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to build the extension
4. Press F5 in VS Code to launch the Extension Development Host
5. Open a test file to see the extension in action

## Release Notes

### 0.0.1

Initial release of Baseline Sentinel with core scanning and fixing capabilities.

---

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License.
