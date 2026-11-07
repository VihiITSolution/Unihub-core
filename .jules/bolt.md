## 2025-03-09 - Message Thread Re-renders
**Learning:** Chat interfaces with typing indicators (`otherUserTyping` state) cause the entire list of messages to re-render constantly. Because messages list grows linearly over time, not memoizing individual message bubbles creates an O(N) rendering bottleneck with typing toggles.
**Action:** When working on chat UI components, ensure that list items (like `MessageBubble`) are wrapped in `React.memo()`, particularly if parent components frequently update state (such as typing indicators or new message arrivals) to avoid re-rendering the whole history.
## 2025-03-09 - List Re-renders in Wall Feed
**Learning:** Feed interfaces (like `WallPage`) with lists of complex cards (`PostCard`) cause the entire feed to re-render when new items are added to the list or when parent states change. Not memoizing individual post cards creates an O(N) rendering bottleneck as the feed grows.
**Action:** When working on feed UI components, ensure that complex list items (like `PostCard`) are wrapped in `React.memo()`, particularly if parent components frequently update state (such as fetching more posts or creating new posts).
## 2025-03-09 - Scroll Events Triggering Re-renders
**Learning:** In scrollable list components (like `FacultyNav`), attaching onScroll event listeners that update state (e.g., `canScrollLeft`, `canScrollRight`) triggers re-renders of the parent component. This causes all children (like `FacultyItem`) to unnecessarily re-render on every scroll tick.
**Action:** Wrap children of heavily updated parent components in `React.memo()` when the children's props are stable (like static data objects), to prevent expensive cascading re-renders during rapid state updates such as scrolling.

## 2025-03-09 - List Re-renders in ConversationList
**Learning:** List components like `ConversationList` containing complex interactive items that update on state changes (e.g., active conversation id changes) can cause the entire list to re-render, leading to an O(N) rendering bottleneck.
**Action:** Extract list items (like `ConversationListItem`) and wrap them in `React.memo()` so only the items whose state actually changes (active/inactive) will re-render during state updates.
