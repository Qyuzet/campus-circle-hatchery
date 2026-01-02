# Database Block - Complete Workflow Explanation

## Overview

The Database Block is a Notion-like database system that allows users to create, manage, and visualize data in multiple views (Table, Board, Gallery, List, Feed, Calendar).

---

## Core Concepts

### 1. Database Structure

```typescript
Database {
  id: string                    // Unique identifier
  name: string                  // Database name (editable)
  properties: Property[]        // Columns/Fields definition
  items: Item[]                 // Rows/Records data
  views: View[]                 // Different visualization layouts
  currentViewId: string         // Which view is active
}
```

### 2. Properties (Columns)

Properties define the structure of your data:

```typescript
Property {
  id: string                    // Unique ID
  name: string                  // Column name (e.g., "Name", "Status")
  type: PropertyType            // Data type (text, number, select, etc.)
  options?: string[]            // For select/multiSelect types
}
```

**Property Types:**

- `text` - Plain text input
- `number` - Numeric input
- `select` - Single choice dropdown (used for Board columns)
- `multiSelect` - Multiple choice
- `date` - Date picker
- `checkbox` - True/false toggle
- `url` - URL with validation
- `email` - Email with validation
- `phone` - Phone number

### 3. Items (Rows)

Items are the actual data records:

```typescript
Item {
  id: string                    // Unique ID
  properties: {                 // Key-value pairs
    [propertyId]: value         // e.g., { "prop1": "John", "prop2": "Active" }
  }
  createdAt: string             // Timestamp
  updatedAt: string             // Timestamp
}
```

### 4. Views (Layouts)

Views are different ways to visualize the same data:

```typescript
View {
  id: string                    // Unique ID
  type: ViewType                // table, board, gallery, etc.
  name: string                  // View name (e.g., "All Tasks")
  groupBy?: string              // Property to group by
  sortBy?: string               // Property to sort by
  sortOrder?: "asc" | "desc"    // Sort direction
  filters?: any[]               // Filter conditions
}
```

---

## Component Hierarchy

```
BlockEditor (manages all blocks)
  └── BlockItem (renders individual block)
      └── DatabaseBlock (main database container)
          ├── DatabaseToolbar (top controls)
          │   ├── View Selector Dropdown
          │   ├── Property Manager Dropdown
          │   └── Settings Button
          └── View Renderer (displays current view)
              ├── TableView
              ├── BoardView
              ├── GalleryView
              ├── ListView
              ├── FeedView
              └── CalendarView
```

---

## Data Flow Pattern

### Unidirectional Data Flow (React Pattern)

All changes flow UP through callbacks, then DOWN through props:

```
User Action → View Component → DatabaseBlock → BlockItem → BlockEditor → State
                                                                            ↓
State Update → BlockEditor → BlockItem → DatabaseBlock → View Component → UI
```

### Example: Adding a Row

1. **User clicks "New" button** in TableView
2. **TableView** calls `onAddItem()` (passed as prop)
3. **DatabaseBlock** receives call via `handleAddItem()`
4. **DatabaseBlock** creates new item:
   ```typescript
   const newItem = {
     id: generateId(),
     properties: {},
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
   };
   ```
5. **DatabaseBlock** calls `onChange()` with updated database:
   ```typescript
   onChange({
     ...database,
     items: [...database.items, newItem],
   });
   ```
6. **BlockItem** receives onChange callback
7. **BlockItem** updates block metadata:
   ```typescript
   onUpdate({
     ...block,
     metadata: { database: updatedDatabase },
   });
   ```
8. **BlockEditor** updates state
9. **React re-renders** with new data
10. **TableView** shows new row

---

## Key Features Explained

### 1. Property Management (Columns)

**Adding a Property:**

- Click `+` button in toolbar
- Opens PropertyEditor dialog
- Fill in: name, type, options (for select)
- Saves to `database.properties` array

**Editing a Property:**

- Click edit icon next to property in dropdown
- Modify name, type, or options
- Updates property in array

**Deleting a Property:**

- Click trash icon
- Removes from `database.properties`
- Also removes property data from all items

### 2. Item Management (Rows)

**Adding an Item:**

- Click "New" button in any view
- Creates empty item with all properties undefined
- User fills in values

**Editing an Item:**

- Click any cell (Table view)
- Type new value
- Calls `onUpdateItem(itemId, { ...properties, [propId]: newValue })`

**Deleting an Item:**

- Click trash icon on row
- Removes from `database.items` array

### 3. View Management

**Switching Views:**

- Click view name in dropdown
- Updates `database.currentViewId`
- View Renderer switches component

**Adding a View:**

- Click "Add View" in dropdown
- Opens ViewEditor dialog
- Creates new view, sets as current

**Editing a View:**

- Click edit icon next to view
- Modify name or type
- Updates view in array

---

## Board View Special Behavior

Board View is unique because it:

1. **Requires a Select Property**

   - Looks for first property with `type: "select"`
   - Uses its options as column names

2. **Empty State**

   - If no select property exists, shows setup screen
   - Offers "Create Columns" button

3. **Inline Column Editor**

   - Click "Edit Columns" button
   - Add/rename/delete columns directly
   - Creates or updates the select property

4. **Column Creation Flow:**
   ```
   User clicks "Create Columns"
   → Opens editor with defaults ["To Do", "In Progress", "Done"]
   → User customizes columns
   → Saves
   → Creates new Property { type: "select", options: [...] }
   → Board displays with columns
   ```

---

## Common Workflows

### Workflow 1: Create a Task Board

1. Type `/` → Select "Database"
2. Switch to "Board" view
3. Click "Create Columns"
4. Customize: "Backlog", "In Progress", "Review", "Done"
5. Click Save
6. Add tasks by clicking "New" in each column

### Workflow 2: Create a Contact List

1. Create database
2. Stay in Table view
3. Click `+` → Add properties:
   - Name (text)
   - Email (email)
   - Phone (phone)
   - Company (text)
4. Click "New" to add contacts
5. Fill in cells

### Workflow 3: Project Tracker

1. Create database
2. Add properties:
   - Project Name (text)
   - Status (select: Planning, Active, Complete)
   - Due Date (date)
   - Priority (select: Low, Medium, High)
3. Switch between Table and Board views
4. Board groups by Status
5. Table shows all details

---

## State Management

### Where is data stored?

```
BlockEditor state (blocks array)
  └── Block object
      └── metadata.database
          └── Complete Database object
```

### How is data persisted?

- BlockEditor calls `onChange(blocks)` prop
- Parent component (e.g., MyAI page) saves to database
- On load, initialBlocks prop restores state

### Why this pattern?

- Single source of truth
- Predictable state updates
- Easy to serialize/deserialize
- Works with React's rendering model

---

## Performance Considerations

1. **Immutable Updates**: Always create new objects, never mutate
2. **Prop Drilling**: Callbacks passed down, data flows up
3. **Re-renders**: Only affected components re-render
4. **Memoization**: Could add React.memo for optimization

---

## Future Enhancements

- Drag-and-drop for Board view
- Filtering and sorting
- Formulas and rollups
- Relations between databases
- Import/export CSV
- Templates

---

## Quick Reference: Key Functions

### DatabaseBlock.tsx

**handleAddItem()**

- Creates new item with empty properties
- Adds to database.items array
- Triggers onChange to propagate up

**handleUpdateItem(itemId, properties)**

- Finds item by ID
- Updates its properties object
- Updates timestamp
- Triggers onChange

**handleDeleteItem(itemId)**

- Filters out item from array
- Triggers onChange

**handleAddProperty(property)**

- Adds to database.properties array
- Triggers onChange

**handleUpdateProperty(propertyId, updates)**

- Finds property by ID
- Merges updates
- Triggers onChange

**handleDeleteProperty(propertyId)**

- Removes from properties array
- Removes property data from all items
- Triggers onChange

**handleViewChange(viewId)**

- Updates database.currentViewId
- Triggers onChange

**handleAddView(view)**

- Adds to database.views array
- Sets as current view
- Triggers onChange

### BoardView.tsx

**handleStartEditingColumns()**

- Gets current options from select property
- Opens inline editor
- Sets default options if none exist

**handleSaveColumns()**

- If property exists: updates its options
- If property doesn't exist: creates new select property
- Closes editor

**handleAddColumn()**

- Adds new option to editing array
- Clears input

**handleRemoveColumn(index)**

- Removes option from editing array

**handleRenameColumn(index, newName)**

- Updates option name in editing array

**getItemsByStatus(status)**

- Filters items where property value matches status
- Returns filtered array

**handleStatusChange(itemId, newStatus)**

- Updates item's status property
- Calls onUpdateItem

---

## Troubleshooting

### Board View shows empty state but I have data

- Check if you have a property with `type: "select"`
- If not, click "Create Columns" to create one

### Changes not saving

- Verify onChange callback is connected
- Check browser console for errors
- Ensure parent component is handling state updates

### Columns not appearing in Board View

- Verify select property has options array
- Check that options array is not empty
- Ensure property type is exactly "select"

### Items not showing in correct column

- Check item.properties[propertyId] value
- Verify it matches one of the column names exactly
- Case-sensitive matching

### Can't delete a property

- Property is removed from database.properties
- Property data is removed from all items
- This is permanent (no undo yet)

---

## Code Examples

### Creating a Database Programmatically

```typescript
const newDatabase: Database = {
  id: generateId(),
  name: "My Tasks",
  properties: [
    {
      id: "prop1",
      name: "Task",
      type: "text",
    },
    {
      id: "prop2",
      name: "Status",
      type: "select",
      options: ["To Do", "In Progress", "Done"],
    },
    {
      id: "prop3",
      name: "Priority",
      type: "select",
      options: ["Low", "Medium", "High"],
    },
  ],
  items: [
    {
      id: "item1",
      properties: {
        prop1: "Build feature",
        prop2: "In Progress",
        prop3: "High",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  views: [
    {
      id: "view1",
      type: "table",
      name: "All Tasks",
    },
    {
      id: "view2",
      type: "board",
      name: "By Status",
      groupBy: "prop2",
    },
  ],
  currentViewId: "view1",
};
```

### Adding an Item with Values

```typescript
const newItem = {
  id: generateId(),
  properties: {
    prop1: "New task name",
    prop2: "To Do",
    prop3: "Medium",
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

onChange({
  ...database,
  items: [...database.items, newItem],
});
```

### Updating a Property's Options

```typescript
const updatedProperty = {
  ...property,
  options: ["Backlog", "In Progress", "Review", "Done", "Archived"],
};

onChange({
  ...database,
  properties: database.properties.map((p) =>
    p.id === propertyId ? updatedProperty : p
  ),
});
```

---

## Summary

The Database Block is a powerful, flexible data management system that:

1. Stores structured data (properties + items)
2. Visualizes data in multiple views
3. Uses React's unidirectional data flow
4. Maintains single source of truth in block metadata
5. Provides rich editing capabilities

Key principles:

- Immutable updates (never mutate, always create new objects)
- Callback-based communication (props down, events up)
- View-agnostic data model (same data, different visualizations)
- User-friendly inline editing (especially Board view columns)

The system is designed to be:

- Intuitive for users
- Maintainable for developers
- Extensible for new features
- Performant for large datasets
