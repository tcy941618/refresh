// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { haveCode, isWorkDay } from './refresh';
import { RefreshViewProvider } from './refreshView';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	const refreshViewProvider = new RefreshViewProvider();
  	vscode.window.registerTreeDataProvider('refreshView', refreshViewProvider);
	const config:any = vscode.workspace.getConfiguration().get('refresh')
	if(haveCode(config.codes)) {
		setInterval(()=>{
			if(isWorkDay()) {
				refreshViewProvider.refresh()
			}
		},config.frequency)
	}
}

// this method is called when your extension is deactivated
export function deactivate() {}
