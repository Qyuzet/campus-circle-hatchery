# Database Block - Quick Cheat Sheet

## Data Structure at a Glance

```
Database
├── id: string
├── name: string
├── properties: Property[]          ← COLUMNS (structure)
│   └── { id, name, type, options? }
├── items: Item[]                   ← ROWS (data)
│   └── { id, properties: {}, createdAt, updatedAt }
├── views: View[]                   ← LAYOUTS (visualization)
│   └── { id, type, name, groupBy?, sortBy? }
└── currentViewId: string           ← ACTIVE VIEW
```

## Property Types

| Type | Description | Example |
|------|-------------|---------|
| `text` | Plain text | "John Doe" |
| `number` | Numeric value | 42 |
| `select` | Single choice | "In Progress" |
| `multiSelect` | Multiple choices | ["Tag1", "Tag2"] |
| `date` | Date picker | "2026-01-15" |
| `checkbox` | Boolean | true/false |
| `url` | Web link | "https://example.com" |
| `email` | Email address | "user@example.com" |
| `phone` | Phone number | "+1234567890" |

## View Types

| Type | Description | Best For |
|------|-------------|----------|
| `table` | Spreadsheet layout | Detailed data entry |
| `board` | Kanban columns | Task management |
| `gallery` | Card grid | Visual content |
| `list` | Simple list | Quick overview |
| `feed` | Timeline feed | Activity stream |
| `calendar` | Calendar grid | Date-based items |

## Component Hierarchy

```
BlockEditor
  └── BlockItem
      └── DatabaseBlock
          ├── DatabaseToolbar
          │   ├── View Selector
          │   ├── Property Manager
          │   └── Settings
          └── View Renderer
              ├── TableView
              ├── BoardView
              ├── GalleryView
              ├── ListView
              ├── FeedView
              └── CalendarView
```

## Data Flow Pattern

```
USER ACTION
    ↓
View Component (e.g., TableView)
    ↓ calls onAddItem()
DatabaseBlock (handleAddItem)
    ↓ calls onChange()
BlockItem
    ↓ calls onUpdate()
BlockEditor
    ↓ updates state
STATE UPDATE
    ↓ re-render
BlockEditor → BlockItem → DatabaseBlock → View → UI
```

## Common Operations

### Add a Row
```typescript
// In DatabaseBlock
handleAddItem() {
  const newItem = {
    id: generateId(),
    properties: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  onChange({ ...database, items: [...database.items, newItem] });
}
```

### Update a Cell
```typescript
// In any View
onUpdateItem(itemId, {
  ...item.properties,
  [propertyId]: newValue
});
```

### Add a Column
```typescript
// In DatabaseBlock
handleAddProperty({
  id: generateId(),
  name: "New Column",
  type: "text"
});
```

### Switch View
```typescript
// In DatabaseBlock
handleViewChange(viewId);
// Updates database.currentViewId
```

## Board View Special Logic

### How Columns Work
1. Finds first property where `type === "select"`
2. Uses `property.options` as column names
3. Filters items: `item.properties[propertyId] === columnName`

### Empty State Flow
```
No select property
    ↓
Show "Set up your Board"
    ↓
User clicks "Create Columns"
    ↓
Show editor with defaults: ["To Do", "In Progress", "Done"]
    ↓
User customizes
    ↓
Save creates new select property
    ↓
Board displays with columns
```

### Edit Columns Flow
```
User clicks "Edit Columns"
    ↓
Load current options into editor
    ↓
User adds/removes/renames
    ↓
Save updates property.options
    ↓
Board re-renders with new columns
```

## Key Files

| File | Purpose |
|------|---------|
| `types/database.ts` | Type definitions |
| `DatabaseBlock.tsx` | Main container, state management |
| `DatabaseToolbar.tsx` | Top controls |
| `views/BoardView.tsx` | Kanban board |
| `views/TableView.tsx` | Spreadsheet |
| `PropertyEditor.tsx` | Add/edit columns |
| `ViewEditor.tsx` | Add/edit views |
| `DatabaseSettings.tsx` | Database config |

## Debugging Tips

### Check Data Structure
```typescript
console.log('Database:', database);
console.log('Properties:', database.properties);
console.log('Items:', database.items);
console.log('Current View:', database.views.find(v => v.id === database.currentViewId));
```

### Board View Not Showing Columns
```typescript
const selectProp = database.properties.find(p => p.type === 'select');
console.log('Select Property:', selectProp);
console.log('Options:', selectProp?.options);
```

### Items Not in Correct Column
```typescript
const statusProperty = database.properties.find(p => p.type === 'select');
database.items.forEach(item => {
  console.log('Item:', item.id, 'Status:', item.properties[statusProperty.id]);
});
```

## Quick Wins

### Create a Task Board
1. Type `/` → Database
2. Switch to Board view
3. Click "Create Columns"
4. Customize columns
5. Add tasks

### Create a Contact List
1. Create database
2. Add properties: Name (text), Email (email), Phone (phone)
3. Stay in Table view
4. Add contacts

### Create a Project Tracker
1. Create database
2. Add: Project (text), Status (select), Due Date (date)
3. Use Board view for status tracking
4. Use Table view for details
5. Use Calendar view for timeline

