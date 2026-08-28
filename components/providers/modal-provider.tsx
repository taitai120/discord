"use client";

import * as React from "react";
import { useModal } from "@/hooks/use-modal-store";
import { getLazyModal } from "@/lib/modal-registry";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = React.useState(false);
  const { type, isOpen } = useModal();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sử dụng useMemo để tối ưu performance
  const LazyModalComponent = React.useMemo(() => {
    if (!type) return null;
    return getLazyModal(type);
  }, [type]);

  if (!isMounted) {
    return null;
  }

  if (!isOpen || !type || !LazyModalComponent) {
    return null;
  }

  return (
    <React.Suspense fallback={<div>Loading modal...</div>}>
      <LazyModalComponent />
    </React.Suspense>
  );
};
