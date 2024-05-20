const readline = require('readline');
const chalk = require('chalk');

class Process {
  constructor(id, name, priority, owner, estimatedTime, status = 1) {
    this.id = id;
    this.name = name;
    this.priority = priority;
    this.owner = owner;
    this.estimatedTime = estimatedTime;
    this.status = status;
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
        case 'view':
          this.viewProcess(args[0]);
          break;
        case 'exit':
          console.log('Exiting...');
          process.exit();
          break;
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
    console.log(chalk.green('Process added to the ready queue.'));
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
  
    const process = new Process(id, name, parseInt(priority), new User('Console User'), parseInt(estimatedTime));
    this.addProcess(process);
    this.readyQueue.sort((a, b) => this.comparator(a.priority, b.priority));
  }

  block() {
    if (this.executingProcess) {
      this.executingProcess.status = 0;
      this.blockedQueue.push(this.executingProcess);
      this.executingProcess = null;
      console.log(chalk.yellow('Process blocked.'));
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
      console.log(chalk.green('Process unblocked.'));
      this.printQueues();
    } else {
      console.log(chalk.red('No blocked processes.'));
    }
  }

  executeProcess() {
    if (this.readyQueue.length > 0) {
      this.executingProcess = this.readyQueue.shift();
      console.log(chalk.blue('Process executing: ' + this.executingProcess.name));
      this.printQueues();
    } else {
      console.log(chalk.red('No processes to execute.'));
    }
  }

  doneExecuting() {
    if (this.executingProcess) {
      console.log(chalk.green('Process finished: ' + this.executingProcess.name));
      this.executingProcess = null;
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
    console.log('  view <processId>');
    console.log('  help');
    console.log('  exit');
  }

  viewProcess(processId) {
    const process = this.readyQueue.find(p => p.id === parseInt(processId)) || this.executingProcess || this.blockedQueue.find(p => p.id === parseInt(processId));

    if (process) {
      console.log(chalk.green('Process ID: ' + process.id));
      console.log('Name: ' + process.name);
      console.log('Priority: ' + process.priority);
      console.log('Owner: ' + process.owner.name);
      console.log('Estimated Time: ' + process.estimatedTime);
      console.log('Status: ' + (process.status === 1 ? 'Executing' : 'Blocked'));
    } else {
      console.log(chalk.red('Process not found.'));
    }
  }

  printQueues() {
    console.log(chalk.blue('Ready Queue: ' + this.readyQueue.map(p => p.id).join(', ')));
    console.log(chalk.blue('Blocked Queue: ' + this.blockedQueue.map(p => p.id).join(', ')));
    console.log(chalk.blue('Executing Process: ' + (this.executingProcess ? this.executingProcess.id : 'None')));
  }

  comparator(a, b) {
    if (a === b) {
      return 0;
    }
    return a < b ? -1 : 1;
  }
}

console.log("Welcome to Printer OS. Type help to check available commands.");
const printerOS = new PrinterOS();
