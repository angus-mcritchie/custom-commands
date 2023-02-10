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
			.then((selectedName) => {
				const command = getCommands().find((command: Command) => command.name === selectedName);

				if (command) {
					execute(command);
				}
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
