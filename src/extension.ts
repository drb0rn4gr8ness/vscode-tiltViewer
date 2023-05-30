// The module 'vscode' contains the VS Code extensibility API
import * as vscode from "vscode";

// This method is called when your extension is activated
export async function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "tiltviewer" is now active!');

  const terminal = getTerminal();

  const upMessage = vscode.commands.registerCommand(
    "tiltviewer.up",
    async () => {
      const tiltFilePath = await getTiltFilePath();

      if (!tiltFilePath) {
        vscode.window.showInformationMessage(
          "No Tiltfile found. Please update `tiltviewer.filePath` in settings"
        );
      } else {
        vscode.window.showInformationMessage(
          "Starting Your Tilt Environment Stack!"
        );
        terminal.show();
        runTerminalCommand(terminal, `tilt up -f ${tiltFilePath}`);
        openWebView(terminal, 3500);
      }
    }
  );

  const downMessage = vscode.commands.registerCommand(
    "tiltviewer.down",
    async () => {
      const tiltFilePath = await getTiltFilePath();
      if (!tiltFilePath) {
        vscode.window.showInformationMessage(
          "No Tiltfile found. Please update `tiltviewer.filePath` in settings"
        );
      } else {
        vscode.window.showInformationMessage(
          "Stopping Your Tilt Environment Stack!"
        );
        terminal.show();
        closeWebView(terminal, tiltFilePath, 2000);
      }
    }
  );

  context.subscriptions.push(...[upMessage, downMessage]);
}

// This method is called when your extension is deactivated
export function deactivate() {
  vscode.commands.executeCommand("tiltviewer.down");
}

async function getTiltFilePath(): Promise<string | null> {
  const files = await vscode.workspace.findFiles("**/Tiltfile");
  for (const file of files) {
    if (file.path.includes("Tiltfile")) {
      return file.fsPath;
    }
  }

  const tiltfileConfigPath = vscode.workspace
    .getConfiguration("tiltviewer")
    .get("filePath");

  if (tiltfileConfigPath && typeof tiltfileConfigPath === "string") {
    return tiltfileConfigPath;
  }

  return null;
}

/**
 * This function sends a command to a terminal in VsCode.
 * @param terminal - The `terminal` parameter is an instance of the `vscode.Terminal` class, which
 * represents a terminal in the VS Code integrated terminal.
 * @param {string} command - The `command` parameter is a string that represents the command to be
 * executed in the terminal. It can be any valid terminal command, such as `ls`, `cd`, or `npm
 * install`.
 */
function runTerminalCommand(terminal: vscode.Terminal, command: string) {
  terminal.sendText(command);
}

/**
 * The function closes a web view and executes some commands with an optional delay.
 * @param terminal - The `terminal` parameter is of type `vscode.Terminal` and represents the terminal
 * instance that will be used to execute the commands.
 * @param {number} [delay=0] - The `delay` parameter is a number that specifies the amount of time (in
 * milliseconds) to wait before executing the code inside the `setTimeout` function. This can be useful
 * if you need to wait for some other operation to complete before running this code
 */
function closeWebView(
  terminal: vscode.Terminal,
  tiltFilePath: string,
  delay: number = 0
) {
  sendInterruptSignal(terminal);
  setTimeout(() => {
    runTerminalCommand(terminal, `tilt down -f ${tiltFilePath}`);
    setContext("tiltviewer.isRunning", false);
    vscode.commands.executeCommand("workbench.action.closeActivePinnedEditor");
  }, delay);
}

/**
 * The function opens a web view in a VS Code terminal and hides the terminal.
 * @param terminal - A reference to a VS Code terminal that will be hidden once the web view is opened.
 * @param {number} [delay=0] - The `delay` parameter is a number that specifies the amount of time (in
 * milliseconds) to wait before opening the web view. If no value is provided for `delay`, it defaults
 * to 0.
 */
function openWebView(terminal: vscode.Terminal, delay: number = 0) {
  const tiltUrl = "http://localhost:10350/r/(all)/overview";
  setTimeout(() => {
    vscode.commands
      .executeCommand("simpleBrowser.show", vscode.Uri.parse(tiltUrl))
      .then(() => {
        terminal.hide();
        /** Pin the Simple Browser so that we can close it once the stop the stack */
        vscode.commands.executeCommand("workbench.action.pinEditor");
        setContext("tiltviewer.isRunning", true);
      });
  }, delay);
}

/**
 * The function sends an interrupt signal to a specified terminal in TypeScript.
 * @param terminal - The `terminal` parameter is of type `vscode.Terminal`, which represents a terminal
 * instance in the VS Code editor. `terminal.sendText("\u0003Y\u000D");` is sending the keyboard interrupt signal to the terminal.
 * This is equivalent to pressing `Ctrl+C` on the keyboard, which is used to stop a running command or process in the terminal.
 * In this case, it is being used to stop the `tilt up` command that is running in the terminal.
 */
function sendInterruptSignal(terminal: vscode.Terminal) {
  terminal.sendText("\u0003Y\u000D");
}

function setContext<T = boolean>(property: string, value: T) {
  vscode.commands.executeCommand("setContext", property, value);
}

/**
 * This function returns an existing terminal named "tiltviewer" or creates a new one if it doesn't
 * exist.
 * @returns The function `getTerminal()` returns a terminal object named "tiltviewer". If such a
 * terminal already exists, it returns that terminal object. Otherwise, it creates a new terminal
 * object with the name "tiltviewer" and returns it.
 */
function getTerminal() {
  for (const openTerminal of vscode.window.terminals) {
    if (openTerminal.name === "tiltviewer") {
      return openTerminal;
    }
  }
  return vscode.window.createTerminal("tiltviewer");
}
