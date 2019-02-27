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
            const wathDirCreated = createFileSystemWatcher(
              `${realPath}/**`,
              false,
              true,
              true
            );

            this.fileWatcher = wathDirCreated.onDidCreate(url => {
              try {
                if (url.path.indexOf(".") <= -1) {
                  this.writeWxFile(url.path);
                }
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

  findSync(startPath) {
    let result = [];
    function finder(path) {
      let files = fs.readdirSync(path);
      files.forEach((val, index) => {
        let fPath = _.join(path, val);
        let stats = fs.statSync(fPath);
        if (stats.isDirectory()) finder(fPath);
        if (stats.isFile()) result.push(fPath);
      });
    }
    finder(startPath);
    return result;
  }

  delDir(path) {
    let files = [];
    if (fs.existsSync(path)) {
      files = fs.readdirSync(path);
      files.forEach((file, index) => {
        let curPath = path + "/" + file;
        if (fs.statSync(curPath).isDirectory()) {
          delDir(curPath); //递归删除文件夹
        } else {
          fs.unlinkSync(curPath); //删除文件
        }
      });
    }
  }

  uniqueArray(arr) {
    const newArr = [];
    arr.forEach(item => {
      if (!newArr.includes(item)) {
        newArr.push(item);
      }
    });
    return newArr;
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
    const appJson = `${workspace.workspaceFolders[0].uri.path}/app.json`;

    wxTemplate.forEach(item => {
      if (this.getFileSuffix(item) === "js") {
        if (templateDir) {
          fs.readFile(TemplatJsPath, function(err, data) {
            if (!err) {
              fs.exists(`${path}/${item}`, function(exists) {
                if (!exists) {
                  fs.writeFile(`${path}/${item}`, data, err => {
                    if (err) throw err;
                  });
                }
              });
            } else {
              fs.exists(`${path}/${item}`, function(exists) {
                if (!exists) {
                  fs.writeFile(`${path}/${item}`, Buffer.from(""), err => {
                    if (err) throw err;
                  });
                }
              });
            }
          });
        } else {
          fs.exists(`${path}/${item}`, function(exists) {
            if (!exists) {
              fs.writeFile(
                `${path}/${item}`,
                Buffer.from("const _ = getApp().globalData._apis;\nPage({});"),
                err => {
                  if (err) throw err;
                }
              );
            }
          });
        }
      } else if (this.getFileSuffix(item) === "json") {
        if (templateDir) {
          fs.readFile(TemplatJsonsPath, function(err, data) {
            if (!err) {
              fs.exists(`${path}/${item}`, function(exists) {
                if (!exists) {
                  fs.writeFile(`${path}/${item}`, data, err => {
                    if (err) throw err;
                  });
                }
              });
            } else {
              fs.exists(`${path}/${item}`, function(exists) {
                if (!exists) {
                  fs.writeFile(`${path}/${item}`, Buffer.from(""), err => {
                    if (err) throw err;
                  });
                }
              });
            }
          });
        } else {
          fs.exists(`${path}/${item}`, function(exists) {
            if (!exists) {
              fs.writeFile(`${path}/${item}`, Buffer.from("{}"), err => {
                if (err) throw err;
              });
            }
          });
        }
      } else if (this.getFileSuffix(item) === "wxml") {
        if (templateDir) {
          fs.readFile(TemplatWxmlPath, function(err, data) {
            if (!err) {
              fs.exists(`${path}/${item}`, function(exists) {
                if (!exists) {
                  fs.writeFile(`${path}/${item}`, data, err => {
                    if (err) throw err;
                  });
                }
              });
            } else {
              fs.exists(`${path}/${item}`, function(exists) {
                if (!exists) {
                  fs.writeFile(`${path}/${item}`, Buffer.from(""), err => {
                    if (err) throw err;
                  });
                }
              });
            }
          });
        } else {
          fs.exists(`${path}/${item}`, function(exists) {
            if (!exists) {
              fs.writeFile(`${path}/${item}`, Buffer.from(""), err => {
                if (err) throw err;
              });
            }
          });
        }
      } else if (this.getFileSuffix(item) === "wxss") {
        if (templateDir) {
          fs.readFile(TemplatWxssPath, function(err, data) {
            if (!err) {
              fs.exists(`${path}/${item}`, function(exists) {
                if (!exists) {
                  fs.writeFile(`${path}/${item}`, data, err => {
                    if (err) throw err;
                  });
                }
              });
            } else {
              fs.exists(`${path}/${item}`, function(exists) {
                if (!exists) {
                  fs.writeFile(`${path}/${item}`, Buffer.from(""), err => {
                    if (err) throw err;
                  });
                }
              });
            }
          });
        } else {
          fs.exists(`${path}/${item}`, function(exists) {
            if (!exists) {
              fs.writeFile(`${path}/${item}`, Buffer.from(""), err => {
                if (err) throw err;
              });
            }
          });
        }
      }
    });
    fs.readFile(appJson, "utf-8", (err, data) => {
      try {
        const jsonConfig = JSON.parse(data);
        const newFileName =
          fileName.indexOf(".") > -1
            ? fileName.slice(0, fileName.indexOf("."))
            : fileName;
        jsonConfig.pages.push(`pages/${newFileName}/${newFileName}`);
        jsonConfig.pages = this.uniqueArray(jsonConfig.pages);
        fs.writeFile(appJson, JSON.stringify(jsonConfig, null, 2), err => {
          if (err) throw err;
        });
      } catch (e) {
        console.log(e);
      }
    });
  }

  debugPage(path) {
    if (path.indexOf("/pages/") <= -1) {
      showInformationMessage("只有 pages 文件夹下的页面可调试, 请检查所选文件");
    } else {
      const fileName = this.getFileName(path);
      const page =
        fileName.indexOf(".") > -1
          ? fileName.slice(0, fileName.indexOf("."))
          : fileName;
      const appJson = `${workspace.workspaceFolders[0].uri.path}/app.json`;
      fs.readFile(appJson, "utf-8", (err, data) => {
        try {
          const jsonConfig = JSON.parse(data);
          jsonConfig.pages.unshift(`pages/${page}/${page}`);
          jsonConfig.pages = this.uniqueArray(jsonConfig.pages);
          fs.writeFile(appJson, JSON.stringify(jsonConfig, null, 2), err => {
            if (err) throw err;
          });
        } catch (e) {
          console.log(e);
        }
      });
    }
  }

  fileWatch() {
    return this.fileWatcher;
  }
  watch() {
    return workspace.onDidChangeConfiguration(() => this.init(0));
  }
}

module.exports = new wxSmartFile();
