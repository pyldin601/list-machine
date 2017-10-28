import * as React from 'react';

interface IConsoleStateInterface {
  history: string[],
  input: string,
}

export default class Console extends React.Component<{}, IConsoleStateInterface> {
  constructor(props: {}) {
    super(props);

    this.state = {
      history: [],
      input: '',
    };

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

  private onInputChange(event: React.ChangeEvent<any>) {
    this.setState({ input: event.target.value });
  }

  private onKeyPressed(event: React.KeyboardEvent<any>) {
    if (event.key === 'Enter') {
      this.setState({
        history: [...this.state.history, this.state.input],
        input: '',
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
