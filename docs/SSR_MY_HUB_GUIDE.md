# SSR My Hub Developer Guide

## Quick Start

The My Hub dashboard has been converted to use Server-Side Rendering (SSR) for better performance and SEO.

### Accessing the New My Hub

```
/dashboard/my-hub?tab=purchases
/dashboard/my-hub?tab=sales
/dashboard/my-hub?tab=library
/dashboard/my-hub?tab=listings
/dashboard/my-hub?tab=events
```

## Component Structure

### Server Components (Data Fetching)

```tsx
// Example: LibraryTab.tsx
export async function LibraryTab({ onSupportClick }) {
  const session = await auth();
  const transactions = await prisma.transaction.findMany({...});
  
  return <LibraryTabClient transactions={transactions} onSupportClick={onSupportClick} />;
}
```

### Client Components (Interactivity)

```tsx
// Example: LibraryTabClient.tsx
"use client";

export function LibraryTabClient({ transactions, onSupportClick }) {
  return (
    <div>
      {transactions.map(t => (
        <LibraryItemCard transaction={t} onSupportClick={onSupportClick} />
      ))}
    </div>
  );
}
```

## Adding New Features

### 1. Adding a New Tab

1. Create server component in `src/components/dashboard/my-hub/NewTab.tsx`:

```tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function NewTab() {
  const session = await auth();
  const data = await prisma.yourModel.findMany({...});
  
  return <NewTabClient data={data} />;
}
```

2. Create client component `NewTabClient.tsx`:

```tsx
"use client";

export function NewTabClient({ data }) {
  return <div>{/* Your UI */}</div>;
}
```

3. Add to `MyHubWrapper.tsx`:

```tsx
{activeTab === "newtab" && <NewTab />}
```

4. Add tab trigger to `MyHubClient.tsx`:

```tsx
<TabsTrigger value="newtab">New Tab</TabsTrigger>
```

### 2. Adding Interactive Features

Use callbacks to communicate between server and client components:

```tsx
// Server Component
<LibraryTab onSupportClick={handleSupportClick} />

// Client Component
<Button onClick={() => onSupportClick({ itemId, itemType, itemTitle })}>
  Support
</Button>
```

### 3. Adding Modals

Add modal state to `MyHubWrapper.tsx`:

```tsx
const [showYourModal, setShowYourModal] = useState(false);
const [modalData, setModalData] = useState(null);

const handleOpenModal = (data) => {
  setModalData(data);
  setShowYourModal(true);
};
```

## Data Flow

```
URL Params → MyHubPage → MyHubWrapper → MyHubClient (tabs)
                                      ↓
                              Active Tab Component (SSR)
                                      ↓
                              Client Component (UI)
                                      ↓
                              User Interaction
                                      ↓
                              Callback to MyHubWrapper
                                      ↓
                              Modal/Action
```

## Best Practices

### 1. Server Components
- Use for data fetching
- Keep them async
- No useState, useEffect, or event handlers
- Can import client components

### 2. Client Components
- Mark with "use client"
- Use for interactivity
- Can use hooks
- Cannot import server components directly

### 3. Data Refresh
- Use `router.refresh()` to refetch server data
- Example in WalletTabClient after withdrawal

### 4. Loading States
- Use Suspense boundaries
- Provide meaningful loading skeletons
- Show loading indicators for async actions

## Common Patterns

### Pattern 1: Fetch and Display

```tsx
// Server Component
export async function DataTab() {
  const data = await fetchData();
  return <DataTabClient data={data} />;
}

// Client Component
"use client";
export function DataTabClient({ data }) {
  return <div>{data.map(...)}</div>;
}
```

### Pattern 2: Interactive Actions

```tsx
// Client Component
"use client";
export function ActionButton({ onAction }) {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    await performAction();
    setLoading(false);
    onAction(); // Notify parent
  };
  
  return <Button onClick={handleClick} disabled={loading}>Action</Button>;
}
```

### Pattern 3: Real-time Updates

```tsx
// Client Component
"use client";
export function LiveData({ initialData }) {
  const router = useRouter();
  
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh(); // Refetch server data
    }, 30000);
    
    return () => clearInterval(interval);
  }, [router]);
  
  return <div>{/* Display data */}</div>;
}
```

## Troubleshooting

### Issue: Data not updating
**Solution**: Use `router.refresh()` to trigger server re-fetch

### Issue: "use client" error
**Solution**: Add "use client" directive at top of file

### Issue: Cannot use hooks in server component
**Solution**: Move interactive logic to client component

### Issue: Props serialization error
**Solution**: Ensure props are JSON-serializable (no functions, Date objects need conversion)

## Performance Tips

1. Keep server components as high as possible in the tree
2. Use Suspense for parallel data fetching
3. Minimize client component size
4. Use React.memo for expensive renders
5. Implement proper loading states

## Security Considerations

1. Never expose sensitive data in client components
2. Validate all user input on server
3. Use server actions for mutations
4. Keep API keys and secrets on server only
5. Implement proper authentication checks

## Testing

```bash
# Run development server
npm run dev

# Test each tab
/dashboard/my-hub?tab=purchases
/dashboard/my-hub?tab=sales
/dashboard/my-hub?tab=library
/dashboard/my-hub?tab=listings
/dashboard/my-hub?tab=events

# Check for errors in console
# Verify data loads correctly
# Test interactive features
# Verify modals work
```

