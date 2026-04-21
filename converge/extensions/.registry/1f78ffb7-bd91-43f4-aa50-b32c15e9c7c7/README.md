# Directus Lexical Editor

A rich text editor interface for Directus using the Lexical framework with React integration.

## ✨ Features

- **Text formatting**: bold, italic, underline, strikethrough
- **Text highlighting**: red highlighting for selected text
- **Custom fonts**: 25px size, "Arabic-1" font family
- **JSON serialization**: proper data persistence and loading
- **React integration**: full support for Lexical React plugins
- **Vue.js wrapper**: Directus compatibility

## 📦 Installation

### Via npm (recommended)
```bash
npm install directus-lexical-editor
```

### Via Directus CLI
```bash
npx directus extension install directus-lexical-editor
```

### Manual installation
1. Download the extension from [npm](https://www.npmjs.com/package/directus-lexical-editor)
2. Copy to `extensions/interfaces/lexical/` folder
3. Restart Directus

## 🚀 Usage

1. **Install the extension** in your Directus project
2. **Create a new field** with type "Text" or "String"
3. **Select "Lexical Editor"** as the interface
4. **Configure field options** as needed

## ⚙️ Configuration

The extension supports the following options:

- **`placeholder`**: Placeholder text for the editor
- **`minHeight`**: Minimum height of the editor
- **`maxHeight`**: Maximum height of the editor

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build the extension
npm run build

# Development mode with watch
npm run dev

# Validate the extension
npm run validate
```

## 📋 Requirements

- Directus ^10.10.0
- Node.js ^18.0.0
- React ^19.2.0

## 🔗 Links

- [npm package](https://www.npmjs.com/package/directus-lexical-editor)
- [GitHub repository](https://github.com/yegoroot/directus-lexical-editor)
- [Directus Marketplace](https://marketplace.directus.io/) (available in a few hours)

## 📄 License

MIT

## 👨‍💻 Author

FSA <easywayroot@gmail.com>
