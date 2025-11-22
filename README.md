# Cat AI Planner

A web application that helps users break down complex goals into actionable tasks using AI-powered task generation.

## Features

- **AI-Powered Task Generation**: Uses Anthropic Claude API to automatically break down goals into specific, actionable tasks
- **Priority-Based Organization**: Tasks are automatically categorized as High, Medium, or Low priority
- **Visual Task Cards**: Beautiful poker card-inspired design with baby pink color scheme
- **Task Management**: Edit, delete, and mark tasks as complete
- **Multiple Task Lists**: Save and manage multiple task lists
- **Local Storage**: All data stored locally in your browser
- **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

1. **Get an Anthropic API Key**:
   - Visit [Anthropic Console](https://console.anthropic.com/)
   - Create an account and generate an API key
   - Keep your API key secure

2. **Open the Application**:
   - Open `index.html` in your web browser
   - Click the Settings button (⚙️) in the top right
   - Enter your Anthropic API key and save

3. **Start Using**:
   - Enter a goal or situation in the text area
   - Click "Breakdown Task" to generate your task list
   - Edit the task list name if needed
   - Save your task list for future reference

## Usage Examples

**Input**: "I have an interview tomorrow"

**Generated Tasks**:
- Research company background and recent news (High Priority, Tonight)
- Prepare answers for common interview questions (High Priority, Tonight)
- Choose and prepare interview outfit (Medium Priority, Tonight)
- Review job description and requirements (High Priority, Tonight)
- Prepare questions to ask interviewer (Medium Priority, Tonight)
- Plan route and timing for interview location (Medium Priority, Morning)
- Print extra copies of resume (Low Priority, Morning)

## File Structure

```
AI planner/
├── index.html          # Main HTML file
├── styles.css          # CSS styling with baby pink theme
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Technical Details

- **Frontend**: Pure HTML, CSS, and JavaScript (no frameworks required)
- **Storage**: Browser LocalStorage for task lists and settings
- **API**: Anthropic Claude API for task generation
- **Deployment**: Can be hosted on any static web hosting service

## Privacy & Security

- All task data is stored locally in your browser
- Your API key is stored securely in browser storage
- No data is sent to external servers except for AI task generation
- You maintain full control over your data

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Any modern browser with JavaScript enabled

## Troubleshooting

**API Key Issues**:
- Ensure your API key is valid and has sufficient credits
- Check the Anthropic Console for any account issues

**Tasks Not Generating**:
- Verify your internet connection
- Try refreshing the page and re-entering your API key
- Check browser console for error messages

**Data Not Saving**:
- Ensure your browser allows localStorage
- Try clearing browser cache and re-entering data

## Future Enhancements

- Export task lists to PDF or text files
- Task templates for common scenarios
- Recurring task support
- Collaboration features
- Cloud sync options

## Support

For issues or questions, check the browser console for error messages and ensure your API key is properly configured.