import * as React from 'react';
import Env from '../../../src/Env';
import evaluate from '../../../src/eval';
import toPrimitive from '../../../src/printer';

interface IConsoleStateInterface {
  history: string[],
  input: string,
}

export default class Console extends React.Component<{}, IConsoleStateInterface> {
  private env: Env;

  constructor(props: {}) {
    super(props);

    this.state = {
      history: [],
      input: '',
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
          className="input"
          onChange={this.onInputChange}
          onKeyPress={this.onKeyPressed}
          value={this.state.input}
        />
      </div>
    );
  }

  private addLineToLog(message: string) {
    this.setState({
      history: [...this.state.history, message],
    });
  }

  private onInputChange(event: React.ChangeEvent<any>) {
    this.setState({ input: event.target.value });
  }

  private onKeyPressed(event: React.KeyboardEvent<any>) {
    if (event.key === 'Enter') {
      const command = this.state.input;
      this.addLineToLog(command);
      this.setState({ input: '' });
      setTimeout(() => {
        try {
          this.addLineToLog(toPrimitive(evaluate(command, this.env)));
        } catch (e) {
          this.addLineToLog(e.message);
        }
      });
    }
  }

  private renderHistory() {
    return <div className="history">
      {this.state.history.map((row, index) => (
        <div className="row">{row}</div>
      ))}
    </div>;
  }
}
