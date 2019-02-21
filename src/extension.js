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
