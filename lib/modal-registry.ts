import { lazy, ComponentType } from "react";
import { ModalType } from "@/hooks/use-modal-store";

// Modal registry - tự động map modal type với component
const modalRegistry: Record<
  ModalType,
  () => Promise<{ default: ComponentType<any> }>
> = {
  createServer: () =>
    import("@/components/modals/create-server-modal").then((module) => ({
      default: module.CreateServerModal,
    })),
  joinServer: () =>
    import("@/components/modals/join-modal").then((module) => ({
      default: module.JoinModal,
    })),
  invite: () =>
    import("@/components/modals/invite-modal").then((module) => ({
      default: module.InviteModal,
    })),
  editServer: () =>
    import("@/components/modals/edit-server-modal").then((module) => ({
      default: module.EditServerModal,
    })),
  members: () =>
    import("@/components/modals/members-modal").then((module) => ({
      default: module.MembersModal,
    })),
  createChannel: () =>
    import("@/components/modals/create-channel-modal").then((module) => ({
      default: module.CreateChannelModal,
    })),
  leaveServer: () =>
    import("@/components/modals/leave-server-modal").then((module) => ({
      default: module.LeaveServerModal,
    })),
  deleteServer: () =>
    import("@/components/modals/delete-server-modal").then((module) => ({
      default: module.DeleteServerModal,
    })),
  deleteChannel: () =>
    import("@/components/modals/delete-channel-modal").then((module) => ({
      default: module.DeleteChannelModal,
    })),
  editChannel: () =>
    import("@/components/modals/edit-channel-modal").then((module) => ({
      default: module.EditChannelModal,
    })),
  messageFile: () =>
    import("@/components/modals/message-file-modal").then((module) => ({
      default: module.MessageFileModal,
    })),
  deleteMessage: () =>
    import("@/components/modals/delete-message-modal").then((module) => ({
      default: module.DeleteMessageModal,
    })),
};

// Function để lấy lazy component dựa trên modal type
export const getLazyModal = (type: ModalType) => {
  const modalLoader = modalRegistry[type];
  if (!modalLoader) {
    console.warn(`Modal type "${type}" not found in registry`);
    return null;
  }
  return lazy(modalLoader);
};

// Function để thêm modal mới vào registry (cho tương lai)
export const registerModal = (
  type: ModalType,
  loader: () => Promise<{ default: ComponentType<any> }>
) => {
  modalRegistry[type] = loader;
};

// Function để lấy tất cả modal types đã đăng ký
export const getRegisteredModalTypes = (): ModalType[] => {
  return Object.keys(modalRegistry) as ModalType[];
};
