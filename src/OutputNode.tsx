import { NodeProps } from "reactflow";
import { NodeData } from "./getEdgesAndNodes";
import { getSizeFromType } from "./getLayoutedNodes";
import { ManyHandles } from "./ManyHandles";
import useStore from "./store";

function OutputNode({ data, type, id }: NodeProps<NodeData>) {
  const { width, height } = getSizeFromType(type);
  const selectNode = useStore((state) => state.selectNodeId);
  return (
    <div
      onClick={() => selectNode(id)}
      style={{
        width,
        height,
        display: "flex",
        justifyContent: "center",
        position: "relative",
        alignItems: "center",
        borderRadius: 10,
        borderStyle: "solid",
        borderWidth: 5,
        borderColor: "teal",
      }}
    >
      <div style={{ padding: 10 }}>
        {data.label}
        <div style={{ textAlign: "center" }}>
          {Math.round(data.value * 100) / 100}
        </div>
      </div>
      <ManyHandles
        type="target"
        weights={new Array(data.numInputWeights).fill(1)}
      />
    </div>
  );
}

export default OutputNode;
