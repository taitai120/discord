import { ModalType } from "@/hooks/use-modal-store";
import { registerModal } from "./modal-registry";

// Helper function để thêm modal mới một cách dễ dàng
export const addModal = (
  type: ModalType,
  componentPath: string,
  componentName: string
) => {
  const loader = () =>
    import(componentPath).then((module) => ({
      default: (module as any)[componentName],
    }));

  registerModal(type, loader);
  console.log(`✅ Modal "${type}" đã được đăng ký thành công!`);
};

// Helper function để tạo modal loader từ component path
export const createModalLoader = (
  componentPath: string,
  componentName: string
) => {
  return () =>
    import(componentPath).then((module) => ({
      default: (module as any)[componentName],
    }));
};

// Example usage:
// addModal("newModal", "@/components/modals/new-modal", "NewModal");


