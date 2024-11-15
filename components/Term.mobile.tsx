import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

const MTerm = () => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Terminal</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm/css/xterm.css">
      <script src="https://cdn.jsdelivr.net/npm/xterm"></script>
      <script src="https://cdn.jsdelivr.net/npm/xterm-addon-fit"></script>
    </head>
    <body>
      <div id="terminal-container" style="width: 100%; height: 100%"></div>
      <script>
        const terminal = new Terminal();
        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);
        terminal.open(document.getElementById('terminal-container'));
        fitAddon.fit();
      </script>
    </body>
    </html>
  `;

  return (
    <View style={{ flex: 1 }}>
      <WebView originWhitelist={['*']} source={{ html: htmlContent }} />
    </View>
  );
};

export default MTerm;
