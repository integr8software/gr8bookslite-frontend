"use client";

import { Toaster, type ToasterProps } from "react-hot-toast";

export function AppToaster(props: Pick<ToasterProps, "position" | "reverseOrder">) {
  return (
    <Toaster
      position={props.position}
      reverseOrder={props.reverseOrder}
      toastOptions={{
        duration: 3500,
        style: {
          borderRadius: "14px",
          background: "#ffffff",
          color: "#212738",
          boxShadow: "0 18px 60px rgba(33, 39, 56, 0.14)",
          border: "1px solid rgba(33, 39, 56, 0.08)",
        },
        success: {
          style: {
            border: "1px solid rgba(34, 197, 94, 0.28)",
          },
        },
        error: {
          style: {
            border: "1px solid rgba(249, 112, 104, 0.28)",
          },
        },
      }}
    />
  );
}
