// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { haveCode } from './refresh';
import { RefreshViewProvider } from './refreshView';

let timer: any

function run(refreshViewProvider:RefreshViewProvider) {
	timer && clearInterval(timer)
	const config:any = vscode.workspace.getConfiguration().get('refresh')
	if(haveCode(config.codes)) {
		timer = setInterval(()=>{
			refreshViewProvider.refresh()
		},config.frequency)
	}
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	const refreshViewProvider = new RefreshViewProvider();
  	vscode.window.registerTreeDataProvider('refreshView', refreshViewProvider);

	run(refreshViewProvider)
	vscode.workspace.onDidChangeConfiguration(function(e) {
		run(refreshViewProvider)
	});

	context.subscriptions.push(vscode.commands.registerCommand('refreshView.refresh', ()=>{
		console.log('dfsas');
		
		run(refreshViewProvider)
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {
	timer && clearInterval(timer)
}
