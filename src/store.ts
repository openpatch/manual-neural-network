import { create } from "zustand";
import { persist, StateStorage, createJSONStorage } from "zustand/middleware";

import { deserializeState, serializeState } from "./serde";
import { NeuralNetwork, initialNN } from "./neuralNetwork";

export type RFState = {
  selectedNodeId: string;
  neuralNetwork: NeuralNetwork;
  updateInputValue: (nodeId: string, value: number) => void;
  updateWeight: (edgeId: string, value: number) => void;
  selectNodeId: (nodeId: string) => void;
};

const hashStorage: StateStorage = {
  getItem: (_): string => {
    return deserializeState(location.hash.slice(1));
  },
  setItem: (_, newValue): void => {
    location.hash = serializeState(newValue);
  },
  removeItem: (_): void => {
    location.hash = "";
  },
};

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create(
  persist<RFState>(
    (set, get) => ({
      selectedNodeId: "",
      selectNodeId: (nodeId: string) => {
        set({
          selectedNodeId: nodeId,
        });
      },
      neuralNetwork: initialNN,
      updateWeight: (edgeId: string, weight: number) => {
        const [layer, level, source, target] = edgeId.split("-");
        const neuralNetwork = get().neuralNetwork;

        if (layer === "input") {
          neuralNetwork.inputLayer[Number(source)].weights[Number(target)] =
            weight;
        } else if (layer === "hidden" && neuralNetwork.hiddenLayers) {
          neuralNetwork.hiddenLayers[Number(level)][Number(source)].weights[
            Number(target)
          ] = weight;
        }
        set({
          neuralNetwork: { ...neuralNetwork },
        });
      },
      updateInputValue: (nodeId: string, value: number) => {
        const [layer, index] = nodeId.split("-");
        const neuralNetwork = get().neuralNetwork;
        if (layer === "input") {
          neuralNetwork.inputLayer[Number(index)].value = value;
        }
        set({
          neuralNetwork: { ...neuralNetwork },
        });
      },
    }),
    {
      name: "pako",
      storage: createJSONStorage(() => hashStorage),
      partialize: (state): any => ({
        neuralNetwork: state.neuralNetwork,
      }),
    }
  )
);

export default useStore;
