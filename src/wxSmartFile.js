const {
  workspace,
  FileSystemProvider,
  RelativePattern,
  window: { showInformationMessage, showErrorMessage }
} = require("vscode");
const vscode = require("vscode");
const fs = require("fs");
const _ = require("path");

class wxSmartFile {
  constructor() {
    this.fileWatcher = null;
  }
  init(type) {
    try {
      const { enabled, path, templateDir } = this.getConfiguration();
      const { createFileSystemWatcher } = workspace;
      if (this.fileWatcher) {
        this.fileWatcher.dispose();
      }
      if (enabled && path) {
        const realPath = `${workspace.workspaceFolders[0].uri.path}/${path}`;
        fs.exists(realPath, exists => {
          if (!exists) {
            showErrorMessage(`未找到 ${path} 文件夹, 请修改 path 字段后重试`);
          } else {
            if (type === 1) {
              showInformationMessage("wx-smart-file 已经运行在您的 vscode 上");
            } else if (type === 0) {
              showInformationMessage("wx-smart-file 已经重新加载");
            }
            const wathDirCreated = createFileSystemWatcher(`${realPath}/**`);
            this.fileWatcher = wathDirCreated.onDidCreate(url => {
              try {
                this.writeWxFile(url.path);
              } catch (e) {
                console.log(e);
              }
            });
            if (templateDir) {
              const templatePath = `${
                workspace.workspaceFolders[0].uri.path
              }/${templateDir}`;
              fs.exists(templatePath, exists => {
                if (!exists) {
                  fs.mkdir(templatePath, {}, err => {
                    if (err) {
                      console.log(err);
                    }
                  });
                }
              });
            }
          }
        });
      } else if (typeof enabled !== "boolean" && !enabled) {
        showErrorMessage(`请确保在用户设置里设置 wxSmartFile.enabled 为 true`);
      } else if (typeof enabled === "boolean" && enabled === false) {
        showErrorMessage(`"wx-smart-file 已经停止运行在您的 vscode 上"`);
      }
    } catch (e) {
      console.log(e);
    }
  }

  getFileName(path) {
    return path.slice(path.lastIndexOf("/") + 1);
  }

  getFileSuffix(s) {
    return s.slice(s.indexOf(".") + 1);
  }

  getConfiguration() {
    return workspace.getConfiguration("wxSmartFile");
  }

  writeWxFile(path) {
    const fileName = this.getConfiguration().fileName || this.getFileName(path);
    const { templateDir } = this.getConfiguration();
    const TemplatJsPath = `${
      workspace.workspaceFolders[0].uri.path
    }/${templateDir}/template.js`;
    const TemplatJsonPath = `${
      workspace.workspaceFolders[0].uri.path
    }/${templateDir}/template.json`;
    const TemplatWxmlPath = `${
      workspace.workspaceFolders[0].uri.path
    }/${templateDir}/template.wxml`;
    const TemplatWxssPath = `${
      workspace.workspaceFolders[0].uri.path
    }/${templateDir}/template.wxss`;
    const wxTemplate = [".wxss", ".wxml", ".js", ".json"].map(
      name => `${fileName}${name}`
    );

    wxTemplate.forEach(item => {
      if (this.getFileSuffix(item) === "js") {
        if (templateDir) {
          fs.readFile(TemplatJsPath, function(err, data) {
            if (!err) {
              fs.writeFile(`${path}/${item}`, data, err => {
                if (err) throw err;
              });
            } else {
              fs.writeFile(`${path}/${item}`, Buffer.from(""), err => {
                if (err) throw err;
              });
            }
          });
        } else {
          fs.writeFile(
            `${path}/${item}`,
            Buffer.from("const _ = getApp().globalData._apis;\nPage({});"),
            err => {
              if (err) throw err;
            }
          );
        }
      } else if (this.getFileSuffix(item) === "json") {
        if (templateDir) {
          fs.readFile(TemplatJsonPath, function(err, data) {
            if (!err) {
              fs.writeFile(`${path}/${item}`, data, err => {
                if (err) throw err;
              });
            } else {
              fs.writeFile(`${path}/${item}`, Buffer.from(""), err => {
                if (err) throw err;
              });
            }
          });
        } else {
          fs.writeFile(`${path}/${item}`, Buffer.from("{}"), err => {
            if (err) throw err;
          });
        }
      } else if (this.getFileSuffix(item) === "wxml") {
        if (templateDir) {
          fs.readFile(TemplatWxmlPath, function(err, data) {
            if (!err) {
              fs.writeFile(`${path}/${item}`, data, err => {
                if (err) throw err;
              });
            } else {
              fs.writeFile(`${path}/${item}`, Buffer.from(""), err => {
                if (err) throw err;
              });
            }
          });
        } else {
          fs.writeFile(`${path}/${item}`, Buffer.from(""), err => {
            if (err) throw err;
          });
        }
      } else if (this.getFileSuffix(item) === "wxss") {
        if (templateDir) {
          fs.readFile(TemplatWxssPath, function(err, data) {
            if (!err) {
              fs.writeFile(`${path}/${item}`, data, err => {
                if (err) throw err;
              });
            } else {
              fs.writeFile(`${path}/${item}`, Buffer.from(""), err => {
                if (err) throw err;
              });
            }
          });
        } else {
          fs.writeFile(`${path}/${item}`, Buffer.from(""), err => {
            if (err) throw err;
          });
        }
      }
    });
  }

  fileWatch() {
    return this.fileWatcher;
  }
  watch() {
    return workspace.onDidChangeConfiguration(() => this.init(0));
  }
}

module.exports = new wxSmartFile();
