import { Handle, NodeProps, Position } from "reactflow";

import { getSizeFromType } from "./getLayoutedNodes";
import useStore from "./store";
import { NodeData } from "./getEdgesAndNodes";

function WeightNode({ id, data, type }: NodeProps<NodeData>) {
  const updateWeight = useStore((state) => state.updateWeight);
  const selectNode = useStore((state) => state.selectNodeId);
  const { width, height } = getSizeFromType(type);
  return (
    <div
      onClick={() => selectNode(id)}
      style={{
        width,
        height,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <input
        style={{
          background: "transparent"
        }}
        type="number"
        step="0.01"
        defaultValue={data?.value}
        onChange={(evt) => updateWeight(id, Number(evt.target.value))}
        className="nodrag"
      />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
}

export default WeightNode;
