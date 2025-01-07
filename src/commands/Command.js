class Command {
  execute(...args) {
    throw new Error("This method should be overwritten!");
  }
}

export default Command;
