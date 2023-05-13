import { NodeProps } from "reactflow";

import useStore from "./store";
import { getSizeFromType } from "./getLayoutedNodes";
import { NodeData } from "./getEdgesAndNodes";
import { ManyHandles } from "./ManyHandles";

function InputNode({ id, data, type }: NodeProps<NodeData>) {
  const { width, height } = getSizeFromType(type);
  const updateInputValue = useStore((state) => state.updateInputValue);
  const selectNode = useStore((state) => state.selectNodeId);

  return (
    <div
      onClick={() => selectNode(id)}
      style={{
        borderRadius: 10,
        width,
        height,
        display: "flex",
        boxSizing: "border-box",
        padding: 8,
        flexDirection: "column",
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        borderStyle: "solid",
        borderWidth: 5,
        borderColor: "blue",
      }}
    >
        <div style={{ textAlign: "center", marginBottom: 8 }}>{data.label}</div>
        <input
          style={{ width: "90%" }}
          type="number"
          defaultValue={data.value}
          step="0.01"
          onChange={(evt) => updateInputValue(id, Number(evt.target.value))}
          className="nodrag"
        />
      <ManyHandles type="source" weights={data.outputWeights} />
    </div>
  );
}

export default InputNode;
