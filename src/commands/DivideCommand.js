export default class DivideCommand {
  constructor(value1, value2) {
    this.value1 = value1;
    this.value2 = value2;
  }

  execute() {
    return this.value1 / this.value2;
  }

  undo() {
    return this.value1;
  }
}
