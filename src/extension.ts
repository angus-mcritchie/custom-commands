import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	handleStartup();
	registerCustomCommands(context);
}

export function deactivate() {
	handleShutdown();
}

function handleStartup() {
	console.log('handleStartup', getCommands().filter((command: Command) => command.runOnStartup));

	getCommands()
		.filter((command: Command) => command.runOnStartup)
		.forEach(execute);
}

function registerCustomCommands(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('custom-commands.run', () => {
		vscode.window.showQuickPick(getCommands().map((command: Command) => command.name))
			.then((selectedName: string | undefined) => {
				const command = getCommands().find((command: Command) => command.name === selectedName);

				if (!command) {
					return;
				}

				// allow vs code variables such as ${file}, ${selectedText} ${folder}, ${workspaceFolder} etc.
				const replacements: { [key: string]: string | undefined } = {
					'${selectedText}': vscode.window.activeTextEditor?.document.getText(vscode.window.activeTextEditor.selection),
					'${file}': vscode.window.activeTextEditor?.document.fileName,
					'${folder}': vscode.window.activeTextEditor?.document.fileName.split('/').slice(0, -1).join('/'),
					'${workspaceFolder}': vscode.workspace.workspaceFolders?.[0].uri.fsPath || '',
				}

				command.command = Object.keys(replacements).reduce((acc, key) => acc.replace(key, replacements[key] || ''), command.command);

				execute(command);
			});
	});

	context.subscriptions.push(disposable);
}

function handleShutdown() {
	console.log('handleShutdown', getCommands());

	getCommands()
		.filter((command: Command) => command.runOnShutdown)
		.forEach(execute);
}

function getCommands(): Command[] {
	return vscode.workspace.getConfiguration('customCommands').get('commands') || [];
}

function execute(command: Command) {
	console.log('execute', command);

	const terminal = vscode.window.createTerminal(command.name);

	terminal.show();
	terminal.sendText(command.command);
}

type Command = {
	name: string;
	command: string;
	runOnStartup?: boolean;
	runOnShutdown?: boolean;
}
