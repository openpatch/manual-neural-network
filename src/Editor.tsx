import CodeMirror from "@uiw/react-codemirror";
import { shallow } from "zustand/shallow";
import useStore, { RFState } from "./store";
import { useCallback, useState } from "react";
import { json } from "@codemirror/lang-json";

const selector = (state: RFState) => ({
  updateNeuralNetwork: state.updateNeuralNetwork,
  neuralNetwork: state.neuralNetwork,
  setRoute: state.setRoute
});

export const Editor = () => {
  const { neuralNetwork, updateNeuralNetwork, setRoute } = useStore(
    selector,
    shallow
  );

  const [data, setData] = useState(JSON.stringify(neuralNetwork, null, 2));

  const onChange = useCallback((value: string) => {
    setData(value);
  }, []);

  const onSave = useCallback(() => {
    updateNeuralNetwork(JSON.parse(data));
  }, [data]);

  const onView = useCallback(() => {
    setRoute("view");
  }, []);

  return (
    <div>
      <CodeMirror height="90vh" value={data} onChange={onChange} extensions={[json()]} />
      <div className="button-group">
        <button onClick={onSave}>Save</button>
        <button onClick={onView}>View</button>
      </div>
    </div>
  );
};
