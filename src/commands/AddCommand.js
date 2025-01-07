// Commande d'addition permettant d'exécuter et d'annuler une addition
export default class AddCommand {
  constructor(value1, value2) {
    this.value1 = value1;
    this.value2 = value2;
  }

  // Exécute l'addition
  execute() {
    return this.value1 + this.value2;
  }

  // Annule l'addition
  undo() {
    return this.value1;
  }
}
