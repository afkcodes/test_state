/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import ChangeNotifier from './state';
import useNotifier from './useNotifier';

const notifier = ChangeNotifier.getInstance<any>();

const Test = () => {
  const { state } = useNotifier('eventName', { count: 0 }, 'test', 'Test');

  const { state: bState } = useNotifier('eventName', { x: 0 }, 'x', 'Test');

  const onClickB = () => {
    notifier.notify('eventName', { count: state.count + 1 }, 'test', 'Test');
    notifier.notify('eventName', { x: bState.x + 2 }, 'x', 'Test');
  };

  // const data = notifier.getState('eventName', 'x');

  return (
    <div>
      <p> {state.count} </p>
      <p> {bState.x} </p>
      <button onClick={onClickB}>EMIT</button>
    </div>
  );
};

function App() {
  // const { state } = useNotifier('A', 0);

  // const onClick = () => {
  //   notifier.notify('A', state + 1);
  // };

  const [show, setShow] = useState(true);

  return (
    <div>
      {show && <Test />}
      {/* {state}
      <Count />
      <button onClick={onClick}>EMIT A </button> */}
      <button
        onClick={() => {
          setShow(!show);
        }}>
        TOGGLE SHOW
      </button>
    </div>
  );
}

export default App;
