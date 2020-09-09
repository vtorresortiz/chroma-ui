import { View, Button, ComboBox, useEventHandler } from "@nodegui/react-nodegui";
import { QPushButtonSignals, QComboBoxSignals, QIcon } from "@nodegui/nodegui";
import React from "react";
import RazerClient from "../clients/razer";
import Color from "color";
import path from "path";
import Constants from "../constants";

export function ChromaSettings() {
  const razerClient = new RazerClient();
  const constants = new Constants();
  let isStarted = false;
  let currentColor = "aliceblue";

  const btnHandlerStart = useEventHandler<QPushButtonSignals>(
    {
      clicked: async () => {
        if (!isStarted) {
          console.log(`start`);
          isStarted = true;
          await razerClient.open();
          await razerClient.set("keyboard", currentColor);
          await razerClient.set("mouse", currentColor);
        }
      }
    },
    []
  );
  const btnHandlerStop = useEventHandler<QPushButtonSignals>(
    {
      clicked: async () => {
        if (isStarted) {
          console.log(`stop`);
          await razerClient.close();
          isStarted = false;
        }
      }
    },
    []
  );
  const comboHandler = useEventHandler<QComboBoxSignals>(
    {
      currentTextChanged: async (newColor: string) => {
        currentColor = newColor;
        if (isStarted) {
          console.log(`currentIndexChanged ${currentColor}`);
          await razerClient.set("keyboard", currentColor);
          await razerClient.set("mouse", currentColor);
        }
      }
    },
    []
  );

  const getColors = () => {
    const colors = constants.colors;
  
    let items: any[] = [];
    for (var color of colors) {
      let filepath = `../images/colors/${Color(color).hex()}.png`;
      let item:{text: string, icon: QIcon} = {text: color, icon: new QIcon(path.resolve(__dirname, filepath))};
      items = [...items, item];
    }
    
    return items;
  }

  return (
    <View style={containerStyle}>
      <ComboBox style={btnStyle} items={getColors()} on={comboHandler} />
      <Button
        style={btnStyle}
        on={btnHandlerStart}
        text={`Start`}
      ></Button>
      <Button
        style={btnStyle}
        on={btnHandlerStop}
        text={`Stop`}
      ></Button>
    </View>
  );
}

const containerStyle = `
  flex: 1;
  justify-content: 'space-around';
`;

const btnStyle = `
  height: 60px;
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px;
`;
