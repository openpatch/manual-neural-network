import ReactFlow, { Controls, Background } from "reactflow";
import "./App.css";
import "reactflow/dist/style.css";

import useStore, { RFState } from "./store";
import { shallow } from "zustand/shallow";
import InputNode from "./InputNode";
import OutputNode from "./OutputNode";
import HiddenNode from "./HiddenNode";
import { getEdgesAndNodes } from "./getEdgesAndNodes";
import { getLayoutedNodes } from "./getLayoutedNodes";
import WeightNode from "./WeightNode";
import { SettingsPanel } from "./SettingsPanel";

const selector = (state: RFState) => ({
  selectedNodeId: state.selectedNodeId,
  neuralNetwork: state.neuralNetwork,
  updateInputValue: state.updateInputValue,
  updateWeight: state.updateWeight,
});

const nodeTypes = {
  inputNeuron: InputNode,
  outputNeuron: OutputNode,
  hiddenNeuron: HiddenNode,
  weight: WeightNode,
};

function App() {
  const { neuralNetwork, selectedNodeId } = useStore(selector, shallow);
  const { edges, nodes } = getLayoutedNodes(getEdgesAndNodes(neuralNetwork));

  edges.forEach((edge) => {
    if (edge.target === selectedNodeId || edge.source === selectedNodeId) {
      edge.style = {
        stroke: "lightcoral",
        strokeWidth: 8,
      };
    }
  });
  nodes.forEach((node) => {
    if (node.id === selectedNodeId) {
      node.style = {
        background: "lightcoral",
        borderRadius:  10
      };
    } else {
      node.style = {
        background: "white",
      };
    }
  });

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodeTypes={nodeTypes}
        minZoom={0.1}
      >
        <SettingsPanel />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}

export default App;
