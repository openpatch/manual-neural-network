import { NodeProps } from "reactflow";

import { getSizeFromType } from "./getLayoutedNodes";
import { NodeData } from "./getEdgesAndNodes";
import { ManyHandles } from "./ManyHandles";
import useStore from "./store";

function HiddenNode({ data, type, id }: NodeProps<NodeData>) {
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
        alignItems: "center",
        position: "relative",
        borderRadius: 10,
        borderStyle: "solid",
        borderWidth: 5,
        borderColor: "grey",
      }}
    >
      <ManyHandles
        type="target"
        weights={new Array(data.numInputWeights).fill(1)}
      />
      <div style={{ padding: 10 }}>{Math.round(data.value * 100) / 100}</div>
      <ManyHandles type="source" weights={data.outputWeights} />
    </div>
  );
}

export default HiddenNode;
