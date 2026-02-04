import ReactFlow, { Controls, Background, Panel } from "reactflow";
import { toPng } from "html-to-image";
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
  setRoute: state.setRoute,
});

const nodeTypes = {
  inputNeuron: InputNode,
  outputNeuron: OutputNode,
  hiddenNeuron: HiddenNode,
  weight: WeightNode,
};

export const Network = () => {
  const { neuralNetwork, selectedNodeId, setRoute } = useStore(
    selector,
    shallow
  );
  const { edges, nodes } = getLayoutedNodes(getEdgesAndNodes(neuralNetwork));
  const onEdit = () => {
    setRoute("edit");
  };
  
  const onCodeEdit = () => {
    setRoute("code");
  };

  const onDownloadPng = () => {
    toPng(document.querySelector(".neural-network") as any, {
      filter: (node) => {
        // we don't want to add the minimap and the controls to the image
        if (
          node?.classList?.contains("react-flow__minimap") ||
          node?.classList?.contains("react-flow__controls") ||
          node?.classList?.contains("button-group")
        ) {
          return false;
        }

        return true;
      },
    }).then((dataUrl) => {
      const a = document.createElement("a");

      a.setAttribute("download", "neural-network.png");
      a.setAttribute("href", dataUrl);
      a.click();
    });
  };

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
        borderRadius: 10,
      };
    } else {
      node.style = {
        background: "white",
      };
    }
  });

  return (
    <ReactFlow
      className="neural-network"
      nodes={nodes}
      proOptions={{
        hideAttribution: true
      }}
      edges={edges}
      fitView
      nodeTypes={nodeTypes}
      minZoom={0.1}
    >
      <Panel position="top-right">
        <div className="button-group">
          <button onClick={onDownloadPng}>Download (PNG)</button>
          <button onClick={onEdit}>Edit (Visual)</button>
          <button onClick={onCodeEdit}>Edit (Code)</button>
        </div>
      </Panel>
      <SettingsPanel />
      <Controls />
      <Background />
    </ReactFlow>
  );
};
