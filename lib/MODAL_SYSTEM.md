# Hệ thống Modal Lazy Loading

## Tổng quan

Hệ thống modal mới sử dụng lazy loading để tối ưu performance và dễ dàng quản lý các modal.

## Cách thêm modal mới

### Bước 1: Tạo modal component

Tạo file modal mới trong `components/modals/` với export default:

```tsx
// components/modals/my-new-modal.tsx
export const MyNewModal = () => {
  // Modal content
};

export default MyNewModal;
```

### Bước 2: Thêm modal type

Thêm type mới vào `hooks/use-modal-store.ts`:

```tsx
export type ModalType =
  | "createServer"
  | "joinServer"
  // ... existing types
  | "myNewModal"; // Thêm type mới
```

### Bước 3: Đăng ký modal

Thêm vào `lib/modal-registry.ts`:

```tsx
const modalRegistry: Record<
  ModalType,
  () => Promise<{ default: React.ComponentType<any> }>
> = {
  // ... existing modals
  myNewModal: () =>
    import("@/components/modals/my-new-modal").then((module) => ({
      default: module.MyNewModal,
    })),
};
```

### Hoặc sử dụng helper (dễ hơn):

```tsx
import { addModal } from "@/lib/modal-helper";

// Thêm vào file khởi tạo app
addModal("myNewModal", "@/components/modals/my-new-modal", "MyNewModal");
```

## Lợi ích

1. **Lazy Loading**: Modal chỉ được load khi cần thiết
2. **Tự động quản lý**: Không cần import thủ công từng modal
3. **Dễ mở rộng**: Thêm modal mới chỉ cần 3 bước đơn giản
4. **Performance**: Giảm bundle size ban đầu
5. **Type Safety**: Đầy đủ TypeScript support

## Sử dụng

```tsx
import { useModal } from "@/hooks/use-modal-store";

const MyComponent = () => {
  const { onOpen } = useModal();

  const handleOpenModal = () => {
    onOpen("myNewModal", {
      /* data */
    });
  };

  return <button onClick={handleOpenModal}>Open Modal</button>;
};
```

## Cấu trúc file

- `lib/modal-registry.ts`: Registry chính quản lý tất cả modal
- `lib/modal-helper.ts`: Helper functions để thêm modal dễ dàng
- `components/providers/modal-provider.tsx`: Provider component với lazy loading
- `hooks/use-modal-store.ts`: Zustand store quản lý modal state


