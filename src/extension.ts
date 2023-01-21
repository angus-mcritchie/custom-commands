// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('custom-commands.run', () => {

		type Command = {
			name: string;
			command: string;
		}

		const config = vscode.workspace.getConfiguration('customCommands');
		const commands = config.get('commands') as Command[];

		vscode.window.showQuickPick(commands.map((command: Command) => command.name))
			.then((selectedName) => {
				const command = commands.find((command: Command) => command.name === selectedName);

				if (command) {
					const terminal = vscode.window.createTerminal(command.name);
					terminal.show();
					terminal.sendText(command.command);
				}
			});
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
