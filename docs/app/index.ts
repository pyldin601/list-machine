import * as Terminal from 'xterm';
import './index.css';

(Terminal as any).loadAddon('fit');

const xterm = new Terminal();

xterm.open(document.getElementById('xterm'));
xterm.write('Hello from Terminal!');
xterm.fit();
