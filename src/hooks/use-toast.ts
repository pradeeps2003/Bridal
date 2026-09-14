import { useToast as useToastPrimitive } from "@/components/ui/toast";

type ToastWithMethods = ReturnType<typeof useToastPrimitive> & {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

export function useToast(): ToastWithMethods {
  const toastPrimitive = useToastPrimitive();

  return {
    ...toastPrimitive,
    success: (title: string, description?: string) => {
      toastPrimitive.toast({
        variant: "success" as const,
        title,
        description,
      });
    },
    error: (title: string, description?: string) => {
      toastPrimitive.toast({
        variant: "destructive" as const,
        title,
        description,
      });
    },
    info: (title: string, description?: string) => {
      toastPrimitive.toast({
        variant: "default" as const,
        title,
        description,
      });
    },
  };
}
