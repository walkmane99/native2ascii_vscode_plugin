'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import Window = vscode.window;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "native2ascii" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.native2ascii', native2ascii);

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function native2ascii() {
    if (!vscode.window.activeTextEditor) {
		vscode.window.showInformationMessage('Open a file first to manipulate text selections');
		return;
    }   
    var items: vscode.QuickPickItem[] = [];

	items.push({ label: "ascii", description: "文字からUnicodeに変換" });
    items.push({ label: "reverse", description: "Unicodeから文字に変換" });
    
    Window.showQuickPick(items).then((selection) => {
		if (!selection) {
			return;
		}
        let e = Window.activeTextEditor;
        if (e) {
            let d = e.document;
            let sel = e.selections;
            switch (selection.label) {
                case "ascii":
                    ascii(e, d, sel);
                    break;
                case "reverse":
                    reverse(e, d, sel);
                    break;
                default:
				    console.log("hum this should not have happend - no selection")
				    break;
            }
        }
    });
}
function reverse(e: vscode.TextEditor, d: vscode.TextDocument, sel: vscode.Selection[]) {
        console.log(d.getText());
        let text = d.getText();
        let newTest = text.split("\n");
        let replaced = "";
        newTest.forEach(val => {
            let reg = val.match(/(\\u[0-9|a-f]{4})/g);
            if (reg) {
                let t = reg.map(unicode => {
                    let codeStrs = unicode.split("\\u");
                    let codePoints = parseInt(codeStrs[1], 16);
                    return {code:`\\${unicode}`, value:String.fromCharCode(codePoints)};
                }).reduce( (v,obj) => {
                    let {code, value} = obj;
                    let reg = new RegExp(code);
                    return v.replace(reg, value);
                }, val);
                replaced = `${replaced}${t}\n`; 
            } else {
                replaced = `${replaced}${val}\n`; 
            }
        });
        e.edit((builder)=>{
            if (e) {
                let startPos = e.document.positionAt(0);
                let endPos = e.document.positionAt(text.length);
                let allRange = new vscode.Range(startPos,endPos);
                builder.replace(allRange,replaced);
            }
        });
}
function ascii(e: vscode.TextEditor, d: vscode.TextDocument, sel: vscode.Selection[]) {
    console.log(d.getText());
    let text = d.getText();
    let newTest = text.split("\n");
    let replaced = "";
    newTest.forEach(val => {
        let reg = val.match(/([^\x01-\x7E])/g);
        if (reg) {
            let t = reg.map(code => {
                let unicode = code.charCodeAt(0).toString(16);
                return {code, value:`\\u${unicode}`};
            }).reduce( (v,obj) => {
                let {code, value} = obj;
                let reg = new RegExp(code);
                return v.replace(reg, value);
            }, val);
            replaced = `${replaced}${t}\n`; 
        } else {
            replaced = `${replaced}${val}\n`; 
        }
    });
    e.edit((builder)=>{
        if (e) {
            let startPos = e.document.positionAt(0);
            let endPos = e.document.positionAt(text.length);
            let allRange = new vscode.Range(startPos,endPos);
            builder.replace(allRange,replaced);
        }
    });
}