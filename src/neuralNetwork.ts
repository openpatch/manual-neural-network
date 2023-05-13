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
      value: 23,
      weights: [0.2, 0.1],
    },
    {
      label: "Anzahl der Rechtschreibfehler",
      value: 1,
      weights: [0.7, 0.8],
    },
    {
      label: "Enthält Links zu verdächtigen Internetseiten",
      value: 3,
      weights: [0.0, 0.1],
    },
    {
      label: "Anzahl der Mails, die der Empfänger schon vom Absender erhalten hat",
      value: 3,
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
