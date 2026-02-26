# Distribution Module

The Distribution module provides tools for exporting, formatting, and scheduling content across different platforms.

## Features

### 1. Download as Image
Export content as styled images for social media platforms.

**Formats:**
- Instagram Square (1080x1080 px)
- Quote Card (1200x630 px)
- Carousel Slide (1080x1080 px)

**Location:** Content Editor (after generating content)

**Usage:**
1. Generate content in the Content Editor
2. Click the "Export" dropdown button
3. Select desired format
4. Image downloads automatically

### 2. Platform Formatting
Auto-format content for different social media platforms with one click.

**Platforms:**
- LinkedIn: Adds paragraph spacing and hashtags
- Twitter: Auto-splits into numbered threads (280 char limit)
- Instagram: Adds emoji spacing and hashtag formatting

**Location:** Content Editor (after generating content) & Distribution Tools tab

**Usage:**
1. Click "Copy for [Platform]" button
2. Content is formatted and copied to clipboard
3. Toast notification confirms copy
4. Preview shows formatted content

### 3. Content Remix
Transform content into different formats using rule-based text processing.

**Formats:**
- Twitter Thread: Split into numbered tweets with hook and CTA
- Carousel Slides: Multiple slides with key points
- Short Hook: Punchy attention-grabber
- LinkedIn Longform: Professional post with hashtags

**Location:** Content Editor (after generating content) & Distribution Tools tab

**Usage:**
1. Click "Remix" button
2. Select desired format
3. Edit remixed content in modal
4. Save to use in editor

### 4. Content Calendar
Month view calendar for scheduling and tracking content.

**Features:**
- Month navigation
- Visual status indicators (Planned/Published/Draft)
- Click dates to view scheduled content
- Schedule new content for specific dates

**Location:** Distribution tab → Content Calendar view

**Status Types:**
- 🔵 Planned: Content scheduled for future
- 🟢 Published: Content already published
- ⚪ Draft: Content in draft state

## File Structure

```
distribution/
├── README.md                    # This file
├── DistributionTab.tsx          # Main tab container
├── DistributionTools.tsx        # Tools view container
├── ContentCalendar.tsx          # Calendar view
├── DownloadAsImage.tsx          # Image export component
├── PlatformFormatter.tsx        # Platform formatting component
└── RemixModal.tsx               # Content remix modal
```

## Utilities

```
utils/
├── imageExport.ts               # HTML to canvas conversion
├── platformFormatters.ts        # Platform-specific formatting
└── contentRemixer.ts            # Rule-based content transformation
```

## Integration Points

### Content Editor (IdentityDrivenEditor.tsx)
- Export button in generated content header
- Remix button in generated content header
- Platform Formatter section below generated content

### App Navigation
- New "Distribution" tab in main navigation
- Accessible from top navigation bar

## Design Principles

1. **Consistent UI**: Follows existing theme system and component patterns
2. **Client-side Only**: No external APIs, all processing done in browser
3. **Responsive**: Works on mobile and desktop
4. **Accessible**: Proper ARIA labels and keyboard navigation
5. **Theme Support**: Adapts to light/dark/grey themes

## Future Enhancements

- Drag-and-drop scheduling in calendar
- Batch export multiple images
- Custom image templates
- Platform-specific character counters
- Auto-scheduling with time zones
- Integration with social media APIs
- Analytics and performance tracking

## Notes

- Image export uses basic canvas rendering (fallback)
- For production, consider adding html2canvas library for better rendering
- Calendar currently stores data in component state
- Backend integration needed for persistent scheduling
- All transformations are rule-based (no AI)
