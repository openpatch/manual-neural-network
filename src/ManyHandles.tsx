import { FC } from "react";
import { Handle, Position } from "reactflow";

export type ManyHandlesProps = {
  type: "source" | "target";
  weights?: number[];
};

export const ManyHandles: FC<ManyHandlesProps> = ({ type, weights }) => {
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        height: "50%",
        right: type == "source" ? 0 : undefined,
        left: type == "target" ? 0 : undefined,
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {weights?.map((_, i) => (
        <Handle
          style={{
            position: "relative",
            transform: "none",
            top: "auto",
          }}
          type={type}
          key={i}
          id={String(i)}
          position={type === "source" ? Position.Right : Position.Left}
        />
      ))}
    </div>
  );
};
