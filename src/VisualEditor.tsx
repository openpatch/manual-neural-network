import { shallow } from "zustand/shallow";
import useStore, { RFState } from "./store";
import { useCallback, useState } from "react";
import { InputNode, HiddenNode } from "./neuralNetwork";
import "./VisualEditor.css";

const selector = (state: RFState) => ({
  updateNeuralNetwork: state.updateNeuralNetwork,
  neuralNetwork: state.neuralNetwork,
  setRoute: state.setRoute
});

export const VisualEditor = () => {
  const { neuralNetwork, updateNeuralNetwork, setRoute } = useStore(
    selector,
    shallow
  );

  const [nn, setNn] = useState(neuralNetwork);

  const onView = useCallback(() => {
    updateNeuralNetwork(nn);
    setRoute("view");
  }, [nn, updateNeuralNetwork, setRoute]);

  const onCancel = useCallback(() => {
    setRoute("view");
  }, [setRoute]);

  // Input Layer handlers
  const updateInputNode = (index: number, field: keyof InputNode, value: any) => {
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
  };

  const removeInputNode = (index: number) => {
    const newNn = { ...nn };
    newNn.inputLayer = newNn.inputLayer.filter((_, i) => i !== index);
    setNn(newNn);
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
    
    // Add weights to input layer
    newNn.inputLayer = newNn.inputLayer.map(node => ({
      ...node,
      weights: [...node.weights, 0.5]
    }));

    // Add weights to hidden layers if they exist
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
  };

  const removeOutputNode = (index: number) => {
    const newNn = { ...nn };
    newNn.outputLayer = newNn.outputLayer.filter((_, i) => i !== index);
    
    // Remove corresponding weights from input layer
    newNn.inputLayer = newNn.inputLayer.map(node => ({
      ...node,
      weights: node.weights.filter((_, i) => i !== index)
    }));

    // Remove weights from hidden layers if they exist
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
  };

  // Hidden Layer handlers
  const addHiddenLayer = () => {
    const newNn = { ...nn };
    const nextLayerSize = newNn.outputLayer.length;
    
    const newLayer: HiddenNode[] = Array(3).fill(null).map(() => ({
      weights: Array(nextLayerSize).fill(0.5)
    }));

    if (!newNn.hiddenLayers) {
      newNn.hiddenLayers = [newLayer];
      // Update input layer weights to point to new hidden layer
      newNn.inputLayer = newNn.inputLayer.map(node => ({
        ...node,
        weights: Array(3).fill(0.5)
      }));
    } else {
      // Update previous layer weights to point to new layer
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
      // No more hidden layers, connect input directly to output
      delete newNn.hiddenLayers;
      newNn.inputLayer = newNn.inputLayer.map(node => ({
        ...node,
        weights: Array(newNn.outputLayer.length).fill(0.5)
      }));
    } else if (layerIndex === newNn.hiddenLayers.length) {
      // Removed last layer, update previous layer to connect to output
      const lastLayerIndex = newNn.hiddenLayers.length - 1;
      newNn.hiddenLayers[lastLayerIndex] = newNn.hiddenLayers[lastLayerIndex].map(() => ({
        weights: Array(newNn.outputLayer.length).fill(0.5)
      }));
    } else {
      // Removed middle layer, update previous layer to connect to next layer
      const nextLayerSize = newNn.hiddenLayers[layerIndex].length;
      if (layerIndex === 0) {
        // Update input layer
        newNn.inputLayer = newNn.inputLayer.map(node => ({
          ...node,
          weights: Array(nextLayerSize).fill(0.5)
        }));
      } else {
        // Update previous hidden layer
        newNn.hiddenLayers[layerIndex - 1] = newNn.hiddenLayers[layerIndex - 1].map(() => ({
          weights: Array(nextLayerSize).fill(0.5)
        }));
      }
    }

    setNn(newNn);
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

    // Update previous layer weights
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
    if (!newNn.hiddenLayers) return;

    newNn.hiddenLayers[layerIndex] = newNn.hiddenLayers[layerIndex].filter((_, i) => i !== nodeIndex);

    // Update previous layer weights
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

  return (
    <div className="visual-editor">
      <div className="editor-header">
        <h1>Neural Network Editor</h1>
        <div className="button-group">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onView} className="primary">Save & View</button>
        </div>
      </div>

      <div className="editor-content">
        {/* Input Layer */}
        <div className="layer-section">
          <div className="layer-header">
            <h2>Input Layer</h2>
            <button onClick={addInputNode} className="add-btn">+ Add Input</button>
          </div>
          <div className="nodes-list">
            {nn.inputLayer.map((node, index) => (
              <div key={index} className="node-card">
                <div className="node-card-header">
                  <h3>Input Node {index + 1}</h3>
                  <button 
                    onClick={() => removeInputNode(index)}
                    className="remove-btn"
                    disabled={nn.inputLayer.length <= 1}
                  >
                    ×
                  </button>
                </div>
                <div className="form-group">
                  <label>Label:</label>
                  <input
                    type="text"
                    value={node.label}
                    onChange={(e) => updateInputNode(index, "label", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Value:</label>
                  <input
                    type="number"
                    value={node.value}
                    onChange={(e) => updateInputNode(index, "value", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label>Weights:</label>
                  <div className="weights-grid">
                    {node.weights.map((weight, wIndex) => (
                      <div key={wIndex} className="weight-input">
                        <label>→ {wIndex + 1}</label>
                        <input
                          type="number"
                          step="0.1"
                          value={weight}
                          onChange={(e) => updateInputWeight(index, wIndex, parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hidden Layers */}
        <div className="layer-section">
          <div className="layer-header">
            <h2>Hidden Layers</h2>
            <button onClick={addHiddenLayer} className="add-btn">+ Add Hidden Layer</button>
          </div>
          {!nn.hiddenLayers || nn.hiddenLayers.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
              No hidden layers. Click "Add Hidden Layer" to create one.
            </p>
          ) : (
            nn.hiddenLayers.map((layer, layerIndex) => (
              <div key={layerIndex} className="hidden-layer">
                <div className="hidden-layer-header">
                  <h3>Hidden Layer {layerIndex + 1}</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => addHiddenNode(layerIndex)} 
                      className="add-node-btn"
                    >
                      + Add Node
                    </button>
                    <button 
                      onClick={() => removeHiddenLayer(layerIndex)}
                      className="remove-layer-btn"
                    >
                      Remove Layer
                    </button>
                  </div>
                </div>
                <div className="nodes-list">
                  {layer.map((node, nodeIndex) => (
                    <div key={nodeIndex} className="node-card">
                      <div className="node-card-header">
                        <h3>Node {nodeIndex + 1}</h3>
                        <button 
                          onClick={() => removeHiddenNode(layerIndex, nodeIndex)}
                          className="remove-btn"
                          disabled={layer.length <= 1}
                        >
                          ×
                        </button>
                      </div>
                      <div className="form-group">
                        <label>Weights:</label>
                        <div className="weights-grid">
                          {node.weights.map((weight, wIndex) => (
                            <div key={wIndex} className="weight-input">
                              <label>→ {wIndex + 1}</label>
                              <input
                                type="number"
                                step="0.1"
                                value={weight}
                                onChange={(e) => updateHiddenWeight(layerIndex, nodeIndex, wIndex, parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Output Layer */}
        <div className="layer-section">
          <div className="layer-header">
            <h2>Output Layer</h2>
            <button onClick={addOutputNode} className="add-btn">+ Add Output</button>
          </div>
          <div className="nodes-list">
            {nn.outputLayer.map((node, index) => (
              <div key={index} className="node-card">
                <div className="node-card-header">
                  <h3>Output Node {index + 1}</h3>
                  <button 
                    onClick={() => removeOutputNode(index)}
                    className="remove-btn"
                    disabled={nn.outputLayer.length <= 1}
                  >
                    ×
                  </button>
                </div>
                <div className="form-group">
                  <label>Label:</label>
                  <input
                    type="text"
                    value={node.label}
                    onChange={(e) => updateOutputNode(index, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
