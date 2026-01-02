# Database System Guide

## Overview

The database system works like Notion's databases. Users can create databases, add items, customize properties, and switch between different views of the same data.

## How It Works

### 1. Creating a Database

Type `/database` in any block and press Enter. This creates a new database with:
- Default properties: Name (text), Status (select), Date (date)
- Empty items list
- 6 available views: Table, Board, Gallery, List, Feed, Calendar

### 2. Adding Items

Click the "New" button at the bottom of any view to add a new item. Each item has:
- Unique ID
- Properties (values for each column/field)
- Created and updated timestamps

### 3. Editing Items

**Table View:**
- Click any cell to edit directly
- Type text, select options, or pick dates
- Changes save automatically

**Board View:**
- Edit card titles inline
- Cards are grouped by Status property
- Add new cards to specific columns

**Gallery View:**
- Edit titles below images
- Click the + card to add new items

**List View:**
- Edit titles inline
- Properties shown as tags below

**Feed View:**
- Edit post titles
- Shows as social media feed

**Calendar View:**
- Click any date to add event
- Events show on their date
- Navigate months with arrows

### 4. Switching Views

Click the view dropdown in the toolbar to switch between:
- Table: Spreadsheet-style rows and columns
- Board: Kanban board grouped by status
- Gallery: Image grid layout
- List: Detailed list with descriptions
- Feed: Social media feed style
- Calendar: Monthly calendar with events

### 5. Managing Properties

Click the + button in toolbar to add new properties. Each property has:
- Name: Column/field name
- Type: text, number, select, date, checkbox, etc.

### 6. Deleting Items

Hover over any item and click the trash icon to delete it.

## Data Structure

All database data is stored in the block's metadata:

```typescript
{
  id: "unique-id",
  name: "Database Name",
  properties: [
    { id: "prop1", name: "Name", type: "text" },
    { id: "prop2", name: "Status", type: "select" }
  ],
  items: [
    {
      id: "item1",
      properties: { prop1: "Task 1", prop2: "Active" },
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    }
  ],
  views: [
    { id: "view1", type: "table", name: "Table" }
  ],
  currentViewId: "view1"
}
```

## Property Types

- **text**: Plain text input
- **number**: Numeric input
- **select**: Single choice dropdown
- **multiSelect**: Multiple choice tags
- **date**: Date picker
- **checkbox**: True/false toggle
- **url**: Link input
- **email**: Email input
- **phone**: Phone number input

## View-Specific Features

**Board View:**
- Groups items by select property
- Drag cards between columns (coming soon)
- Add cards directly to columns

**Calendar View:**
- Requires a date property
- Click dates to add events
- Shows up to 2 events per day
- Navigate months

**Gallery View:**
- Image property support (coming soon)
- Grid layout
- Responsive columns

## Tips

1. Use Table view for detailed data entry
2. Use Board view for project management
3. Use Calendar view for scheduling
4. Use Gallery view for visual content
5. Use List view for detailed descriptions
6. Use Feed view for activity streams

## Future Enhancements

- Drag and drop items between views
- Filters and sorting
- Formulas and rollups
- Relations between databases
- Templates
- Import/export data

