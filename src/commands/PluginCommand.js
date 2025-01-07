export default class PluginCommand {
  execute() {
    throw new Error('Méthode execute() non implémentée');
  }

  undo() {
    throw new Error('Méthode undo() non implémentée');
  }
}
