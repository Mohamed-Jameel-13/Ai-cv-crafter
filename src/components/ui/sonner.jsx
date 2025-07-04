import { Toaster as Sonner } from "sonner";

export function Toaster(props) {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      expand={false}
      richColors={true}
      closeButton={true}
      duration={3000}
      style={{ zIndex: 9999 }}
      toastOptions={{
        style: {
          pointerEvents: "auto",
        },
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}
