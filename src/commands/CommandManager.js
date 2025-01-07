
// commands/CommandManager.js
export default class CommandManager {
  constructor() {
    this.commands = {};
  }

  registerCommand(name, command) {
    this.commands[name] = command;
  }

  executeCommand(name, value) {
    const command = this.commands[name];
    if (!command) {
      throw new Error(`Commande ${name} non enregistrée`);
    }
    return command.execute(value);
  }
}
