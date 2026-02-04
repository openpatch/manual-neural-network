import ReactFlow, { 
  Controls, 
  Background, 
  Panel,
  NodeMouseHandler,
} from "reactflow";
import { shallow } from "zustand/shallow";
import useStore, { RFState } from "./store";
import { useCallback, useState } from "react";
import { getEdgesAndNodes } from "./getEdgesAndNodes";
import { getLayoutedNodes } from "./getLayoutedNodes";
import InputNode from "./InputNode";
import OutputNode from "./OutputNode";
import HiddenNode from "./HiddenNode";
import WeightNode from "./WeightNode";
import "./FlowEditor.css";
import { InputNode as InputNodeType, HiddenNode as HiddenNodeType } from "./neuralNetwork";

const selector = (state: RFState) => ({
  updateNeuralNetwork: state.updateNeuralNetwork,
  neuralNetwork: state.neuralNetwork,
  setRoute: state.setRoute
});

const nodeTypes = {
  inputNeuron: InputNode,
  outputNeuron: OutputNode,
  hiddenNeuron: HiddenNode,
  weight: WeightNode,
};

export const FlowEditor = () => {
  const { neuralNetwork, updateNeuralNetwork, setRoute } = useStore(
    selector,
    shallow
  );

  const [nn, setNn] = useState(neuralNetwork);
  const [selectedNode, setSelectedNode] = useState<{
    type: 'input' | 'hidden' | 'output';
    layerIndex?: number;
    nodeIndex: number;
  } | null>(null);

  const { edges, nodes } = getLayoutedNodes(getEdgesAndNodes(nn));

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    const [type, ...rest] = node.id.split('-');
    if (type === 'input') {
      setSelectedNode({ type: 'input', nodeIndex: parseInt(rest[0]) });
    } else if (type === 'hidden') {
      setSelectedNode({ type: 'hidden', layerIndex: parseInt(rest[0]), nodeIndex: parseInt(rest[1]) });
    } else if (type === 'output') {
      setSelectedNode({ type: 'output', nodeIndex: parseInt(rest[0]) });
    }
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onSave = useCallback(() => {
    updateNeuralNetwork(nn);
    setRoute("view");
  }, [nn, updateNeuralNetwork, setRoute]);

  const onCancel = useCallback(() => {
    setRoute("view");
  }, [setRoute]);

  // Input Layer handlers
  const updateInputNode = (index: number, field: keyof InputNodeType, value: any) => {
    const newNn = { ...nn };
    newNn.inputLayer = [...newNn.inputLayer];
    newNn.inputLayer[index] = { ...newNn.inputLayer[index], [field]: value };
    setNn(newNn);
  };

  const updateInputWeight = (nodeIndex: number, weightIndex: number, value: number) => {
    const newNn = { ...nn };
    newNn.inputLayer = [...newNn.inputLayer];
    newNn.inputLayer[nodeIndex] = { 
      ...newNn.inputLayer[nodeIndex], 
      weights: [...newNn.inputLayer[nodeIndex].weights]
    };
    newNn.inputLayer[nodeIndex].weights[weightIndex] = value;
    setNn(newNn);
  };

  const addInputNode = () => {
    const newNn = { ...nn };
    const outputCount = nn.hiddenLayers?.[0]?.length || nn.outputLayer.length;
    newNn.inputLayer = [
      ...newNn.inputLayer,
      { label: "New Input", value: 0, weights: Array(outputCount).fill(0.5) }
    ];
    setNn(newNn);
    setSelectedNode({ type: 'input', nodeIndex: newNn.inputLayer.length - 1 });
  };

  const removeInputNode = (index: number) => {
    if (nn.inputLayer.length <= 1) return;
    const newNn = { ...nn };
    newNn.inputLayer = newNn.inputLayer.filter((_, i) => i !== index);
    setNn(newNn);
    setSelectedNode(null);
  };

  // Output Layer handlers
  const updateOutputNode = (index: number, label: string) => {
    const newNn = { ...nn };
    newNn.outputLayer = [...newNn.outputLayer];
    newNn.outputLayer[index] = { label };
    setNn(newNn);
  };

  const addOutputNode = () => {
    const newNn = { ...nn };
    newNn.outputLayer = [...newNn.outputLayer, { label: "New Output" }];
    
    newNn.inputLayer = newNn.inputLayer.map(node => ({
      ...node,
      weights: [...node.weights, 0.5]
    }));

    if (newNn.hiddenLayers) {
      newNn.hiddenLayers = newNn.hiddenLayers.map((layer, i) => 
        i === newNn.hiddenLayers!.length - 1
          ? layer.map(node => ({
              ...node,
              weights: [...node.weights, 0.5]
            }))
          : layer
      );
    }

    setNn(newNn);
    setSelectedNode({ type: 'output', nodeIndex: newNn.outputLayer.length - 1 });
  };

  const removeOutputNode = (index: number) => {
    if (nn.outputLayer.length <= 1) return;
    const newNn = { ...nn };
    newNn.outputLayer = newNn.outputLayer.filter((_, i) => i !== index);
    
    newNn.inputLayer = newNn.inputLayer.map(node => ({
      ...node,
      weights: node.weights.filter((_, i) => i !== index)
    }));

    if (newNn.hiddenLayers) {
      newNn.hiddenLayers = newNn.hiddenLayers.map((layer, i) => 
        i === newNn.hiddenLayers!.length - 1
          ? layer.map(node => ({
              ...node,
              weights: node.weights.filter((_, wi) => wi !== index)
            }))
          : layer
      );
    }

    setNn(newNn);
    setSelectedNode(null);
  };

  // Hidden Layer handlers
  const addHiddenLayer = () => {
    const newNn = { ...nn };
    const nextLayerSize = newNn.outputLayer.length;
    
    const newLayer: HiddenNodeType[] = Array(3).fill(null).map(() => ({
      weights: Array(nextLayerSize).fill(0.5)
    }));

    if (!newNn.hiddenLayers) {
      newNn.hiddenLayers = [newLayer];
      newNn.inputLayer = newNn.inputLayer.map(node => ({
        ...node,
        weights: Array(3).fill(0.5)
      }));
    } else {
      const lastLayerIndex = newNn.hiddenLayers.length - 1;
      newNn.hiddenLayers[lastLayerIndex] = newNn.hiddenLayers[lastLayerIndex].map(() => ({
        weights: Array(3).fill(0.5)
      }));
      newNn.hiddenLayers = [...newNn.hiddenLayers, newLayer];
    }

    setNn(newNn);
  };

  const removeHiddenLayer = (layerIndex: number) => {
    const newNn = { ...nn };
    if (!newNn.hiddenLayers || newNn.hiddenLayers.length === 0) return;

    newNn.hiddenLayers = newNn.hiddenLayers.filter((_, i) => i !== layerIndex);

    if (newNn.hiddenLayers.length === 0) {
      delete newNn.hiddenLayers;
      newNn.inputLayer = newNn.inputLayer.map(node => ({
        ...node,
        weights: Array(newNn.outputLayer.length).fill(0.5)
      }));
    } else if (layerIndex === newNn.hiddenLayers.length) {
      const lastLayerIndex = newNn.hiddenLayers.length - 1;
      newNn.hiddenLayers[lastLayerIndex] = newNn.hiddenLayers[lastLayerIndex].map(() => ({
        weights: Array(newNn.outputLayer.length).fill(0.5)
      }));
    } else {
      const nextLayerSize = newNn.hiddenLayers[layerIndex].length;
      if (layerIndex === 0) {
        newNn.inputLayer = newNn.inputLayer.map(node => ({
          ...node,
          weights: Array(nextLayerSize).fill(0.5)
        }));
      } else {
        newNn.hiddenLayers[layerIndex - 1] = newNn.hiddenLayers[layerIndex - 1].map(() => ({
          weights: Array(nextLayerSize).fill(0.5)
        }));
      }
    }

    setNn(newNn);
    setSelectedNode(null);
  };

  const addHiddenNode = (layerIndex: number) => {
    const newNn = { ...nn };
    if (!newNn.hiddenLayers) return;

    const nextLayerSize = layerIndex === newNn.hiddenLayers.length - 1
      ? newNn.outputLayer.length
      : newNn.hiddenLayers[layerIndex + 1].length;

    newNn.hiddenLayers[layerIndex] = [
      ...newNn.hiddenLayers[layerIndex],
      { weights: Array(nextLayerSize).fill(0.5) }
    ];

    if (layerIndex === 0) {
      newNn.inputLayer = newNn.inputLayer.map(node => ({
        ...node,
        weights: [...node.weights, 0.5]
      }));
    } else {
      newNn.hiddenLayers[layerIndex - 1] = newNn.hiddenLayers[layerIndex - 1].map(node => ({
        ...node,
        weights: [...node.weights, 0.5]
      }));
    }

    setNn(newNn);
  };

  const removeHiddenNode = (layerIndex: number, nodeIndex: number) => {
    const newNn = { ...nn };
    if (!newNn.hiddenLayers || newNn.hiddenLayers[layerIndex].length <= 1) return;

    newNn.hiddenLayers[layerIndex] = newNn.hiddenLayers[layerIndex].filter((_, i) => i !== nodeIndex);

    if (layerIndex === 0) {
      newNn.inputLayer = newNn.inputLayer.map(node => ({
        ...node,
        weights: node.weights.filter((_, i) => i !== nodeIndex)
      }));
    } else {
      newNn.hiddenLayers[layerIndex - 1] = newNn.hiddenLayers[layerIndex - 1].map(node => ({
        ...node,
        weights: node.weights.filter((_, i) => i !== nodeIndex)
      }));
    }

    setNn(newNn);
    setSelectedNode(null);
  };

  const updateHiddenWeight = (layerIndex: number, nodeIndex: number, weightIndex: number, value: number) => {
    const newNn = { ...nn };
    if (!newNn.hiddenLayers) return;

    newNn.hiddenLayers[layerIndex] = [...newNn.hiddenLayers[layerIndex]];
    newNn.hiddenLayers[layerIndex][nodeIndex] = {
      ...newNn.hiddenLayers[layerIndex][nodeIndex],
      weights: [...newNn.hiddenLayers[layerIndex][nodeIndex].weights]
    };
    newNn.hiddenLayers[layerIndex][nodeIndex].weights[weightIndex] = value;

    setNn(newNn);
  };

  const renderEditPanel = () => {
    if (!selectedNode) {
      return (
        <div className="edit-panel">
          <h3>Network Structure</h3>
          <div className="structure-buttons">
            <button onClick={addInputNode} className="add-btn">+ Add Input Node</button>
            <button onClick={addHiddenLayer} className="add-btn">+ Add Hidden Layer</button>
            <button onClick={addOutputNode} className="add-btn">+ Add Output Node</button>
          </div>
          
          <div className="labels-section">
            <h4>Input Labels</h4>
            {nn.inputLayer.map((node, index) => (
              <div key={index} className="label-row">
                <span>Input {index + 1}:</span>
                <input
                  type="text"
                  value={node.label}
                  onChange={(e) => updateInputNode(index, "label", e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="labels-section">
            <h4>Output Labels</h4>
            {nn.outputLayer.map((node, index) => (
              <div key={index} className="label-row">
                <span>Output {index + 1}:</span>
                <input
                  type="text"
                  value={node.label}
                  onChange={(e) => updateOutputNode(index, e.target.value)}
                />
              </div>
            ))}
          </div>

          <p style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
            Click on a node to edit its properties
          </p>
        </div>
      );
    }

    const onDeselect = () => setSelectedNode(null);

    if (selectedNode.type === 'input') {
      const node = nn.inputLayer[selectedNode.nodeIndex];
      return (
        <div className="edit-panel">
          <div className="panel-header">
            <h3>Input Node {selectedNode.nodeIndex + 1}</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={onDeselect} className="deselect-btn">Back</button>
              <button 
                onClick={() => removeInputNode(selectedNode.nodeIndex)}
                className="delete-btn"
                disabled={nn.inputLayer.length <= 1}
              >
                Delete
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Label:</label>
            <input
              type="text"
              value={node.label}
              onChange={(e) => updateInputNode(selectedNode.nodeIndex, "label", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Value:</label>
            <input
              type="number"
              value={node.value}
              onChange={(e) => updateInputNode(selectedNode.nodeIndex, "value", parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="form-group">
            <label>Weights:</label>
            <div className="weights-list">
              {node.weights.map((weight, wIndex) => (
                <div key={wIndex} className="weight-row">
                  <span>→ Output {wIndex + 1}</span>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => updateInputWeight(selectedNode.nodeIndex, wIndex, parseFloat(e.target.value) || 0)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (selectedNode.type === 'hidden' && selectedNode.layerIndex !== undefined) {
      const node = nn.hiddenLayers![selectedNode.layerIndex][selectedNode.nodeIndex];
      return (
        <div className="edit-panel">
          <div className="panel-header">
            <h3>Hidden Layer {selectedNode.layerIndex + 1}, Node {selectedNode.nodeIndex + 1}</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={onDeselect} className="deselect-btn">Back</button>
              <button 
                onClick={() => removeHiddenNode(selectedNode.layerIndex!, selectedNode.nodeIndex)}
                className="delete-btn"
                disabled={nn.hiddenLayers![selectedNode.layerIndex].length <= 1}
              >
                Delete Node
              </button>
              <button 
                onClick={() => removeHiddenLayer(selectedNode.layerIndex!)}
                className="delete-btn"
              >
                Delete Layer
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Weights:</label>
            <div className="weights-list">
              {node.weights.map((weight, wIndex) => (
                <div key={wIndex} className="weight-row">
                  <span>→ Output {wIndex + 1}</span>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => updateHiddenWeight(selectedNode.layerIndex!, selectedNode.nodeIndex, wIndex, parseFloat(e.target.value) || 0)}
                  />
                </div>
              ))}
            </div>
          </div>
          <button 
            onClick={() => addHiddenNode(selectedNode.layerIndex!)}
            className="add-btn"
            style={{ marginTop: '12px', width: '100%' }}
          >
            + Add Node to This Layer
          </button>
        </div>
      );
    }

    if (selectedNode.type === 'output') {
      const node = nn.outputLayer[selectedNode.nodeIndex];
      return (
        <div className="edit-panel">
          <div className="panel-header">
            <h3>Output Node {selectedNode.nodeIndex + 1}</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={onDeselect} className="deselect-btn">Back</button>
              <button 
                onClick={() => removeOutputNode(selectedNode.nodeIndex)}
                className="delete-btn"
                disabled={nn.outputLayer.length <= 1}
              >
                Delete
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Label:</label>
            <input
              type="text"
              value={node.label}
              onChange={(e) => updateOutputNode(selectedNode.nodeIndex, e.target.value)}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flow-editor">
      <ReactFlow
        className="flow-canvas"
        nodes={nodes}
        edges={edges}
        fitView
        nodeTypes={nodeTypes}
        minZoom={0.1}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        proOptions={{
          hideAttribution: true
        }}
      >
        <Panel position="top-left">
          <div className="editor-actions">
            <button onClick={onCancel}>Cancel</button>
            <button onClick={onSave} className="primary">Save & View</button>
          </div>
        </Panel>
        <Panel position="top-right">
          {renderEditPanel()}
        </Panel>
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};
