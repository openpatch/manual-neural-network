import dagre from "dagre";
import { Node, Edge } from "reactflow";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

export const getSizeFromType = (
  type?: string
): { width: number; height: number } => {
  if (type === "inputNeuron") {
    return {
      width: 300,
      height: 180,
    };
  } else if (type === "outputNeuron") {
    return {
      width: 170,
      height: 90,
    };
  } else if (type === "hiddenNeuron") {
    return {
      width: 90,
      height: 90,
    };
  } else if (type === "weight") {
    return {
      width: 170,
      height: 40
    }
  }

  return {
    width: 170,
    height: 90,
  };
};

export const getLayoutedNodes = ({
  nodes,
  edges,
}: {
  nodes: Node[];
  edges: Edge[];
}) => {
  dagreGraph.setGraph({
    rankdir: "LR",
    nodesep: 20,
    ranksep: 150
  });

  nodes.forEach((node) => {
    const { width, height } = getSizeFromType(node.type);

    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const { width, height } = getSizeFromType(node.type);
    node.position = {
      x: nodeWithPosition.x - width / 2,
      y: nodeWithPosition.y - height / 2,
    };
  });

  return { nodes, edges };
};
