import { Text, Window, hot, View } from "@nodegui/react-nodegui";
import React from "react";
import { ChromaSettings } from "./views/chroma-setup";

const minSize = { width: 500, height: 520 };
class App extends React.Component {
  render() {
    return (
      <Window
        windowTitle=""
        minSize={minSize}
        styleSheet={styleSheet}
      >
        <View style={containerStyle}>
          <Text id="setup-txt">chroma setup</Text>
          <ChromaSettings />
        </View>
      </Window>
    );
  }
}

const containerStyle = `
  flex: 1; 
`;

const styleSheet = `
  #setup-txt {
    font-size: 18px;
    padding-top: 10px;
    padding-horizontal: 20px;
  }
`;

export default hot(App);
