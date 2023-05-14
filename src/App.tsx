import "./App.css";
import "reactflow/dist/style.css";

import { Network } from "./Network";
import useStore, { RFState } from "./store";
import { shallow } from "zustand/shallow";
import { Editor } from "./Editor";

const selector = (state: RFState) => ({
  route: state.route
});

function App() {
  const { route } = useStore(
    selector,
    shallow
  );

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {route === "view" &&
      <Network />}
      {route === "edit" && <Editor />}
    </div>
  );
}

export default App;
