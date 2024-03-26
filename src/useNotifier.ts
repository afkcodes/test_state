import { useCallback, useEffect, useState } from 'react';
import ChangeNotifier, { ListenerCallback } from './state';

/**
 * Represents the UseNotifier hook for ChangeNotifier.
 * @module useNotifier
 * @exports useNotifier
 * @author Ashish Kumar
 */

/**
 * Custom hook for subscribing to and updating state based on ChangeNotifier events.
 * @template T - The type of data associated with the event.
 * @param {string} eventName - The name of the event.
 * @param {T} initialState - The initial state associated with the event.
 * @param {string} sliceName - The name of the slice within the event.
 * @param {string} caller - The identifier of the caller.
 * @returns {{ state: T; notify: (eventName: string, data: T) => void }} - The state object and notify function.
 */
const useNotifier = <T>(
  eventName: string,
  initialState: T,
  sliceName: string,
  caller: string = 'use_notifier'
): { state: T; notify: (eventName: string, data: T) => void } => {
  const notifier = ChangeNotifier.getInstance<T>();
  const prevNotifierState = notifier.getState(eventName, sliceName);

  const [state, setState] = useState<T>(prevNotifierState ?? initialState);

  const handleUpdate: ListenerCallback<T> = useCallback((data: T) => {
    setState(data);
  }, []);

  useEffect(() => {
    notifier.listen(eventName, handleUpdate, initialState, sliceName);
    return () => {
      notifier.unsubscribe(eventName, handleUpdate, sliceName);
    };
  }, [eventName, handleUpdate, notifier, initialState, sliceName]);

  /**
   * Notifies the ChangeNotifier of a state update.
   * @param {string} eventName - The name of the event.
   * @param {T} data - The data to be passed to the listeners.
   * @returns {void}
   */
  const notify = (eventName: string, data: T): void => {
    notifier.notify(eventName, data, sliceName, caller);
  };

  return { state: state, notify };
};

export default useNotifier;
