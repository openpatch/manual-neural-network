export type InputNode = {
  label: string;
  value: number;
  weights: number[];
};

export type HiddenNode = {
  weights: number[];
};

export type OutputNode = {
  label: string;
};

export type NeuralNetwork = {
  inputLayer: InputNode[];
  hiddenLayers?: HiddenNode[][];
  outputLayer: OutputNode[];
};

export const initialNN: NeuralNetwork = {
  inputLayer: [
    {
      label: "Anzahl der Empfänger",
      value: 1,
      weights: [0.2, 0.1],
    },
    {
      label: "Vertrauenswürdiger Absender",
      value: 0.4,
      weights: [0.7, 0.8],
    },
    {
      label: "Anzahl der Links",
      value: 3,
      weights: [0.0, 0.1],
    },
    {
      label: "Anzahl Wörter im Betreff",
      value: 3,
      weights: [0.0, 0.1],
    },
    {
      label: "Anzahl Emojis im Betreff",
      value: 0,
      weights: [0.0, 0.1],
    },
    {
      label: "Text enthält Namen des Empfängers",
      value: 0,
      weights: [0.0, 0.1],
    },
  ],
  outputLayer: [
    {
      label: "Spam",
    },
    {
      label: "Kein Spam",
    },
  ],
};
