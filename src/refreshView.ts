import * as vscode from 'vscode';

import {run} from './refresh'

export class RefreshViewProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;
    getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        console.log(element);
        
        return element;
    }
    getChildren(element?: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
        const config:any = vscode.workspace.getConfiguration().get('refresh')
        return new Promise((resolve)=>{
            run(config.codes, (rank:string='', stocks?:string)=>{
                resolve([{label: rank||'nothing'}, ...(stocks ? stocks.split('\n').map(stock=>({label: stock})) : [])])
            })
        })
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}