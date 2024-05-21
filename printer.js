const readline = require('readline');
const chalk = require('chalk');

class Process {
  id = 0;
  constructor(name, priority, owner, estimatedTime, status = 1) {
    this.id += 1;
    this.name = name;
    this.priority = priority;
    this.owner = owner;
    this.estimatedTime = estimatedTime;
    this.status = status;
  }

  printStatus(process){
    switch (process.status){
      case 0:
        return 'blocked';
      case 1:
        return 'ready';
      case 3:
        return 'printing';
      case 4:
        return 'done';
    }
      
  }

  toString() {
    return `${this.id}. ${this.name} (p: ${this.priority}, o: ${this.owner}, e: ${this.estimatedTime}, s: ${this.printStatus(this)})`;
  }
}

class PrinterOS {
  constructor() {
    this.readyQueue = [];
    this.blockedQueue = [];
    this.executingProcess = null;
    this.timeStamp = 0;

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.rl.setPrompt('Printer OS> ');
    this.rl.prompt();

    this.rl.on('line', (input) => {
      const [command, ...args] = input.trim().split(' ');

      switch (command) {
        case 'add':
          this.addProcessFromConsole(args);
          break;
        case 'block':
          this.block();
          break;
        case 'unblock':
          this.unblock();
          break;
        case 'execute':
          this.executeProcess();
          break;
        case 'done':
          this.doneExecuting();
          break;
        case 'help':
          this.help();
          break;
        case 'init':
          this.init();
          break;
        case 'exit':
          console.log('Exiting...');
          process.exit();
        default:
          console.log(chalk.red('Invalid command. Use "help" for a list of available commands.'));
      }

      this.rl.prompt();
    });

    this.rl.on('close', () => {
      console.log('Exiting...');
      process.exit();
    });
  }

  addProcess(process) {
    this.readyQueue.push(process);
    this.readyQueue.sort((a, b) => this.comparator(a.priority, b.priority));
    console.log(chalk.yellow('Process added to the ready queue.'));
    this.printQueues();
  }

  addProcessFromConsole(args) {
    if (args.length < 3) {
      console.log('Invalid number of arguments. Use add <name> <priority> <estimatedTime>');
      return;
    }
  
    const [name, priority, estimatedTime] = args;
    const id = this.readyQueue.length + 1;
  
    if (isNaN(priority) || isNaN(estimatedTime) || estimatedTime <= 0) {
      console.log('Invalid priority or estimatedTime. Use add <name> <priority> <estimatedTime>');
      return;
    }
  
    const process = new Process(name, parseInt(priority), 'Console User', parseInt(estimatedTime));
    this.addProcess(process);
  }

  block() {
    if (this.executingProcess) {
      this.executingProcess.status = 0;
      this.blockedQueue.push(this.executingProcess);
      this.executingProcess = null;
      console.log(chalk.yellow('Process blocked.'));
      this.executeProcess();
      this.printQueues();
    } else {
      console.log(chalk.red('No process is currently executing.'));
    }
  }

  unblock() {
    if (this.blockedQueue.length > 0) {
      this.blockedQueue.sort((a, b) => a.priority - b.priority);
      while (this.blockedQueue.length > 0) {
        this.readyQueue.push(this.blockedQueue.shift());
      }
      this.readyQueue.sort((a, b) => this.comparator(a.priority, b.priority));
      console.log(chalk.yellow('Process unblocked.'));
      this.printQueues();
    } else {
      console.log(chalk.red('No blocked processes.'));
    }
  }

  executeProcess() {
    if (this.readyQueue.length > 0) {
      this.executingProcess = this.readyQueue.shift();
      this.executingProcess.status = 3;
      console.log(chalk.yellow(`Process executing: ${this.executingProcess.name}`));
      this.printQueues();
    } else {
      console.log(chalk.red('No processes to execute.'));
    }
  }

  doneExecuting() {
    if (this.executingProcess) {
      this.executingProcess.status = 4;
      console.log(chalk.green(`Process finished: ${this.executingProcess.name}`));
      this.executingProcess = null;
      this.executeProcess();
      this.printQueues();
    } else {
      console.log(chalk.red('No process is currently executing.'));
    }
  }

  help() {
    console.log('Available commands:');
    console.log('  add <name> <priority> <estimatedTime>');
    console.log('  block');
    console.log('  unblock');
    console.log('  execute');
    console.log('  done');
    console.log('  init');
    console.log('  help');
    console.log('  exit');
  }

  init(){
    const p1 = new Process('sample1', 1, 'user', 3);
    const p2 = new Process('sample2', 2, 'user', 5);
    const p3 = new Process('sample3', 3, 'user', 7);
    const p4 = new Process('sample4', 2, 'user', 8);
    const p5 = new Process('sample5', 1, 'user', 10);
    const p6 = new Process('sample6', 3, 'user', 6);
    
    this.addProcess(p1);
    this.addProcess(p2);
    this.addProcess(p3);
    this.executeProcess();
    this.doneExecuting();
    this.block();
    this.addProcess(p4);
    this.doneExecuting();
    this.addProcess(p5);
    this.block();
    this.addProcess(p6);
    this.unblock();
    this.doneExecuting();
    this.doneExecuting();
    this.doneExecuting();
    this.doneExecuting();
    
    console.log('Exiting...');
    process.exit();
  }

  printQueues() {
    console.log(chalk.bgBlue.black('Ready Queue:'));
    this.readyQueue.forEach((process) => {
      console.log(chalk.blue(process.toString()));
    });
    console.log(chalk.bgRed.black('\nBlocked Queue:'));
    this.blockedQueue.forEach((process) => {
      console.log(chalk.red(`${process.id}. ${process.name} (p: ${process.priority}, o: ${process.owner}, e: ${process.estimatedTime}, s: blocked)`));
    });
    console.log(chalk.bgGreen.black('\nExecuting Process:'));
    console.log(chalk.green(this.executingProcess ? this.executingProcess.toString() : 'None') + '\n');
  }

  comparator(a, b) {
    if (a === b) {
      return 0;
    }
    return a < b ? -1 : 1;
  }
}

console.log("Welcome to Printer OS. Type 'help' to check available commands.");
const printerOS = new PrinterOS();
