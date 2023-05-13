import { Edge, Node } from "reactflow";
import { NeuralNetwork } from "./neuralNetwork";

export type NodeData = {
  label: string;
  value: number;
  outputWeights?: number[];
  numInputWeights?: number;
};

export type EdgeData = {
  weight: number;
};

export const getEdgesAndNodes = ({
  inputLayer,
  hiddenLayers,
  outputLayer,
}: NeuralNetwork): { edges: Edge<EdgeData>[]; nodes: Node<NodeData>[] } => {
  let nodes: Node<NodeData>[] = [];
  let edges: Edge<EdgeData>[] = [];

  let valuesForLayers: number[][] = [];

  if (!hiddenLayers) {
    const values: number[] = [];
    const numInputWeights = inputLayer.length;
    inputLayer.forEach((node, i) => {
      nodes.push({
        id: `input-${i}`,
        type: "inputNeuron",
        data: {
          label: node.label,
          value: node.value,
          outputWeights: node.weights,
        },
        position: { x: 0, y: 0 },
      });

      node.weights.forEach((weight, n) => {
        if (!values[n]) {
          values[n] = weight * node.value;
        } else {
          values[n] += weight * node.value;
        }
        edges.push({
          id: `input-0-${i}-${n}-0`,
          animated: true,
          source: `input-${i}`,
          sourceHandle: `${n}`,
          target: `input-0-${i}-${n}`,
        });
        nodes.push({
          id: `input-0-${i}-${n}`,
          type: "weight",
          data: {
            label: node.label,
            value: weight,
          },
          position: { x: 0, y: 0 },
        });
        edges.push({
          id: `input-0-${i}-${n}-1`,
          animated: true,
          source: `input-0-${i}-${n}`,
          target: `output-${n}`,
          targetHandle: `${i}`,
        });
      });

      valuesForLayers.push(values);
    });

    outputLayer.forEach((node, i) => {
      nodes.push({
        id: `output-${i}`,
        type: "outputNeuron",
        data: {
          label: node.label,
          value: values[i],
          numInputWeights,
        },
        position: { x: 0, y: 0 },
      });
    });
  } else {
    let values: number[] = [];
    let numInputWeights = inputLayer.length;
    inputLayer.forEach((node, i) => {
      nodes.push({
        id: `input-${i}`,
        type: "inputNeuron",
        data: {
          label: node.label,
          value: node.value,
          outputWeights: node.weights,
        },
        position: { x: 0, y: 0 },
      });

      node.weights.forEach((weight, n) => {
        if (!values[n]) {
          values[n] = weight * node.value;
        } else {
          values[n] += weight * node.value;
        }
        edges.push({
          id: `input-0-${i}-${n}-0`,
          source: `input-${i}`,
          sourceHandle: `${n}`,
          animated: true,
          target: `input-0-${i}-${n}`,
          targetHandle: `${i}`,
        });
        nodes.push({
          id: `input-0-${i}-${n}`,
          type: "weight",
          data: {
            label: node.label,
            value: weight,
          },
          position: { x: 0, y: 0 },
        });
        edges.push({
          id: `input-0-${i}-${n}-1`,
          source: `input-0-${i}-${n}`,
          animated: true,
          target: `hidden-0-${n}`,
          targetHandle: `${i}`,
        });
      });
    });

    valuesForLayers.push(values);

    hiddenLayers.forEach((layer, i) => {
      values = [];
      layer.forEach((node, n) => {
        nodes.push({
          id: `hidden-${i}-${n}`,
          type: "hiddenNeuron",
          data: {
            label: "hidden",
            value: valuesForLayers[i][n],
            outputWeights: node.weights,
            numInputWeights,
          },
          position: { x: 0, y: 0 },
        });

        node.weights.forEach((weight, k) => {
          let target = `output-${k}`;
          if (i < hiddenLayers.length - 1) {
            target = `hidden-${i + 1}-${k}`;
          }
          if (!values[k]) {
            values[k] = weight * valuesForLayers[i][n];
          } else {
            values[k] += weight * valuesForLayers[i][n];
          }
          edges.push({
            id: `hidden-${i}-${n}-${k}-0`,
            source: `hidden-${i}-${n}`,
            sourceHandle: `${k}`,
            target: `hidden-${i}-${n}-${k}`,
            animated: true,
          });
          nodes.push({
            id: `hidden-${i}-${n}-${k}`,
            type: "weight",
            data: {
              label: "",
              value: weight,
            },
            position: { x: 0, y: 0 },
          });
          edges.push({
            id: `hidden-${i}-${n}-${k}-1`,
            source: `hidden-${i}-${n}-${k}`,
            sourceHandle: `${k}`,
            target: target,
            targetHandle: `${n}`,
            animated: true,
          });
        });
      });
      numInputWeights = layer.length;
      valuesForLayers.push(values);
    });

    outputLayer.forEach((node, i) => {
      nodes.push({
        id: `output-${i}`,
        type: "outputNeuron",
        data: {
          label: node.label,
          value: values[i],
          numInputWeights,
        },
        position: { x: 0, y: 0 },
      });
    });
  }

  return {
    edges,
    nodes,
  };
};
