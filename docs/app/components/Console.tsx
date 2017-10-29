import * as cn from 'classnames';
import * as compose from 'compose-function';
import * as React from 'react';
import Env from '../../../src/Env';
import evaluate from '../../../src/eval';
import toPrimitive from '../../../src/printer';

interface IHistoryItem {
  message: string,
  type: 'normal' | 'error',
}

interface IConsoleStateInterface {
  input: string,
  log: IHistoryItem[],
}

export default class Console extends React.Component<{}, IConsoleStateInterface> {
  private env: Env;

  constructor(props: {}) {
    super(props);

    this.state = {
      input: '',
      log: [],
    };

    this.env = new Env();

    this.onInputChange = this.onInputChange.bind(this);
    this.onKeyPressed = this.onKeyPressed.bind(this);
  }

  public render() {
    return (
      <div className="console">
        {this.renderHistory()}
        <input
          autoFocus={true}
          className="input"
          onChange={this.onInputChange}
          onKeyPress={this.onKeyPressed}
          value={this.state.input}
        />
      </div>
    );
  }

  private writeToLog(message: string, type: IHistoryItem['type']) {
    setTimeout(() => {
      const historyItem = { message, type };
      this.setState({
        log: [...this.state.log, historyItem],
      });
    });
  }

  private onInputChange(event: React.ChangeEvent<any>) {
    this.setState({ input: event.target.value });
  }

  private onKeyPressed(event: React.KeyboardEvent<any>) {
    if (event.key === 'Enter') {
      const command = this.state.input;
      this.setState({ input: '' });
      this.evaluateCommand(command);
    }
  }

  private evaluateCommand(command: string) {
    this.writeToLog(command, 'normal');

    try {
      const chain = compose(String, toPrimitive, (cmd: string) => evaluate(cmd, this.env));
      this.writeToLog(chain(command), 'normal');
    } catch (e) {
      this.writeToLog(e.message, 'error');
    }
  }

  private renderHistory() {
    return <div className="history">
      {this.state.log.map((row, index) => (
        <div className={cn('row', row.type)} key={index}>{row.message}</div>
      ))}
    </div>;
  }
}
