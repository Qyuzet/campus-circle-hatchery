# Food Order Workflow Implementation

## Overview
Successfully implemented the complete food ordering workflow in the SSR Messages component, including order requests, seller acceptance/rejection, and payment integration.

## Changes Made

### 1. ChatArea Component (`src/components/dashboard/messages/ChatArea.tsx`)

#### Added Imports
- `Image` from `next/image` for displaying food images

#### Updated Props Interface
Added three new callback props:
- `onAcceptOrder?: (messageId: string) => void` - Handler for seller accepting orders
- `onRejectOrder?: (messageId: string) => void` - Handler for seller rejecting orders
- `onPayOrder?: (message: any) => void` - Handler for buyer payment

#### Added Order Request UI
Created special message card for `messageType === "order_request"`:
- Displays food image (80x80px)
- Shows food title, price, pickup location, and pickup time
- **For Sellers (receiver)**: Shows Accept/Decline buttons when status is "pending"
- **Status Indicators**:
  - ✓ Order Accepted (green)
  - ✗ Order Declined (red)
  - ✓ Payment Completed (blue)

#### Added Payment Request UI
Created special message card for `messageType === "payment_request"`:
- Shows order details (item, amount, pickup location, time)
- **For Buyers (receiver)**: Shows "Pay Now" button when status is "awaiting_payment"
- **Status Indicator**: ✓ Payment Completed (green)

### 2. MessagesClient Component (`src/components/dashboard/messages/MessagesClient.tsx`)

#### Added Imports
- `paymentAPI` from `@/lib/api`
- Global `Window` interface declaration for Midtrans Snap

#### Implemented Handler Functions

**`handleAcceptOrder(messageId: string)`**
- Calls `/api/messages/${messageId}/respond` with action "accept"
- Shows success toast
- Reloads messages to update UI
- Triggers creation of payment request message on backend

**`handleRejectOrder(messageId: string)`**
- Calls `/api/messages/${messageId}/respond` with action "reject"
- Shows success toast
- Reloads messages to update UI

**`handlePayOrder(message: any)`**
- Creates payment via `paymentAPI.createPayment()`
- Opens Midtrans Snap payment popup
- Handles payment callbacks:
  - **onSuccess**: Updates message status to "paid", redirects to My Hub
  - **onPending**: Shows pending notification
  - **onError**: Shows error notification
  - **onClose**: Logs popup closure

#### Updated ChatArea Props
Added the three new handler props to ChatArea component:
```typescript
onAcceptOrder={handleAcceptOrder}
onRejectOrder={handleRejectOrder}
onPayOrder={handlePayOrder}
```

## Complete Workflow

### Step 1: Buyer Orders Food
1. User clicks "Buy Food" in Marketplace → Food tab
2. Creates conversation with seller
3. Sends order request message with food details
4. Redirects to Messages page

### Step 2: Seller Receives Order
1. Seller sees order request card in Messages
2. Card shows food image, title, price, pickup details
3. Seller clicks **Accept** or **Decline**

### Step 3A: Seller Accepts
1. Order status updates to "accepted"
2. System creates payment request message
3. Buyer sees "Pay Now" button

### Step 3B: Seller Declines
1. Order status updates to "rejected"
2. Workflow ends

### Step 4: Buyer Pays
1. Buyer clicks "Pay Now"
2. Midtrans payment popup opens
3. Buyer completes payment

### Step 5: Payment Success
1. Message status updates to "paid"
2. FoodOrder record created in database
3. Food quantity decremented
4. Buyer redirected to My Hub → Purchases

## Technical Details

### Message Types
- `order_request` - Initial order from buyer to seller
- `payment_request` - Payment request from seller to buyer after acceptance
- `text` - Regular text messages

### Order Data Structure
```typescript
{
  type: "food_order",
  foodId: string,
  foodTitle: string,
  foodImage: string,
  price: number,
  pickupLocation: string,
  pickupTime: string,
  status: "pending" | "accepted" | "rejected" | "awaiting_payment" | "paid"
}
```

### API Endpoints Used
- `POST /api/messages/${id}/respond` - Accept/reject orders
- `POST /api/payment/create` - Create Midtrans payment
- `PATCH /api/messages/${id}` - Update message orderData

## UI/UX Features
- Professional card design with blue/green color coding
- Food images displayed in order cards
- Clear status indicators with icons
- Responsive button layouts
- Real-time updates via Pusher
- Toast notifications for all actions
- Automatic message reloading after actions

## Testing Checklist
- [ ] Order request appears in seller's messages
- [ ] Accept button creates payment request
- [ ] Decline button updates status correctly
- [ ] Pay Now button opens Midtrans popup
- [ ] Payment success updates message status
- [ ] Payment success creates FoodOrder record
- [ ] Real-time updates work for both users
- [ ] UI displays correctly on mobile and desktop

