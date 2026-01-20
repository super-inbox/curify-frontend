# Nano Banana Prompts

## Overview
This directory contains prompt templates and utilities for the Curify frontend application. These prompts are used to generate content, handle user interactions, and manage the application's AI-driven features.

## Directory Structure
```
nano-banna-prompts/
├── templates/        # Prompt templates for different use cases
├── utils/           # Utility functions for prompt processing
└── README.md        # This file
```

## Getting Started
1. **Prerequisites**
   - Node.js 16+
   - npm or yarn
   - Access to the Curify frontend project

2. **Installation**
   ```bash
   # Install dependencies
   npm install
   # or
   yarn install
   ```

## Usage
To use the prompts in your application:

```javascript
import { generatePrompt } from './nano-banna-prompts/templates';

const prompt = generatePrompt({
  type: 'contentGeneration',
  params: {
    // Your parameters here
  }
});
```

## Available Prompts
- **Content Generation**: Generate blog posts, articles, and other content
- **User Interaction**: Handle user queries and responses
- **Data Processing**: Process and transform data for display

## Contributing
1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
