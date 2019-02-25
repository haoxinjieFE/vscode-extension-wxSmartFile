const vscode = require("vscode");
const wxSmartFile = require("./wxSmartFile.js");
const { MemFS } = require("./fs.js");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("wxSmartFile.init", () => {
      wxSmartFile.init(1);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("wxSmartFile.stop", () => {
      try {
        if (wxSmartFile.fileWatch() && wxSmartFile.watch()) {
          wxSmartFile.fileWatch().dispose();
          wxSmartFile.watch().dispose();
        }
      } catch (e) {
        console.log(e);
      }
      vscode.window.showErrorMessage(
        "wx-smart-file 已经停止运行在您的 vscode 上"
      );
    })
  );
  context.subscriptions.push(wxSmartFile.fileWatch());
  context.subscriptions.push(wxSmartFile.watch());
}

function deactivate() {
  wxSmartFile.fileWatch().dispose();
  wxSmartFile.watch().dispose();
}

module.exports = {
  activate,
  deactivate
};
