/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Represents the ChangeNotifier module.
 * @module ChangeNotifier
 * @exports ChangeNotifier
 * @author Ashish Kumar
 */

/**
 * Represents a callback function that listens to changes notified by the ChangeNotifier.
 * @template T - The type of data being passed to the callback.
 * @param {T} data - The data passed to the callback.
 * @returns {void}
 */
export type ListenerCallback<T> = (data: T) => void;

/**
 * Checks whether the provided value is a valid object.
 * @param {*} value - The value to be checked.
 * @returns {value is object | null} - True if the value is a valid object, otherwise false.
 */
export const checkValidObject = (value: any): value is object | null =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  value.constructor === Object;

/**
 * Checks whether the provided value is a valid function.
 * @param {*} value - The value to be checked.
 * @returns {boolean} - True if the value is a valid function, otherwise false.
 */
export const checkValidFunction = (value: any) =>
  value instanceof Function && typeof value === 'function';

/**
 * Represents a ChangeNotifier that facilitates event notification and subscription.
 * @template T - The type of data associated with the event.
 */
class ChangeNotifier<T> {
  private static instance: ChangeNotifier<any>;
  private listeners: Record<string, Record<string, Set<ListenerCallback<T>>>> = {};
  private notifierState: Record<string, Record<string, T>> = {};

  private constructor() {}

  /**
   * Gets the singleton instance of ChangeNotifier.
   * @returns {ChangeNotifier<T>} - The singleton instance of ChangeNotifier.
   */
  public static getInstance<T>(): ChangeNotifier<T> {
    if (!ChangeNotifier.instance) {
      ChangeNotifier.instance = new ChangeNotifier();
    }
    return ChangeNotifier.instance;
  }

  /**
   * Validates whether the event name is a non-empty string.
   * @param {string} eventName - The name of the event.
   * @returns {boolean} - True if the event name is valid, otherwise false.
   */
  private validateEvent(eventName: string): boolean {
    return Boolean(eventName && typeof eventName === 'string');
  }

  /**
   * Notifies all subscribed callbacks of a specific event slice with provided data.
   * @param {string} eventName - The name of the event.
   * @param {T} data - The data associated with the event slice.
   * @param {string} sliceName - The name of the slice within the event.
   * @param {string} caller - The identifier of the caller.
   * @throws Will throw an error if the event name is invalid.
   * @returns {void}
   */
  notify(eventName: string, data: T, sliceName: string, caller: string): void {
    if (!this.validateEvent(eventName)) {
      throw new Error(`Invalid event name: '${eventName}'`);
    }

    if (!this.listeners[eventName]) {
      console.warn(`No listeners for event: '${eventName}' called by '${caller}'.`);
      return;
    }

    const sliceListeners = this.listeners[eventName][sliceName];
    if (!sliceListeners) {
      console.warn(
        `No listeners found for slice: '${sliceName}' of event: '${eventName}' called by '${caller}'.`
      );
      return;
    }

    const stateData = checkValidObject(data)
      ? { ...(this.notifierState[eventName][sliceName] || {}), ...data }
      : data;

    this.notifierState[eventName][sliceName] = stateData;

    sliceListeners.forEach((cb) => cb(stateData));

    console.log(`Notify called for '${eventName}' by '${caller}', data:`, data);
    console.log(this.notifierState);
  }

  /**
   * Subscribes a callback function to a specific event slice.
   * @param {string} eventName - The name of the event.
   * @param {ListenerCallback<T>} callback - The callback function to be invoked on event notification.
   * @param {T} initialState - The initial state associated with the event slice.
   * @param {string} sliceName - The name of the slice within the event.
   * @throws Will throw an error if the event name or callback function is invalid.
   * @returns {void}
   */
  listen(
    eventName: string,
    callback: ListenerCallback<T>,
    initialState: T = {} as T,
    sliceName: string
  ): void {
    if (!this.validateEvent(eventName) || !checkValidFunction(callback)) {
      throw new Error(`Invalid parameters for event: '${eventName}'`);
    }

    if (!this.listeners[eventName] || !this.notifierState[eventName]) {
      this.listeners[eventName] = {};
      this.notifierState[eventName] = {};
    }

    if (!this.listeners[eventName][sliceName]) {
      this.listeners[eventName][sliceName] = new Set<ListenerCallback<T>>();
      this.notifierState[eventName][sliceName] = initialState;
    }

    this.listeners[eventName][sliceName].add(callback);
  }

  /**
   * Unsubscribes a callback function from a specific event slice.
   * @param {string} eventName - The name of the event.
   * @param {ListenerCallback<T>} callback - The callback function to be unsubscribed.
   * @param {string} sliceName - The name of the slice within the event.
   * @throws Will throw an error if no listeners are found for the specified event.
   * @returns {void}
   */
  unsubscribe(eventName: string, callback: ListenerCallback<T>, sliceName: string): void {
    if (!this.validateEvent(eventName) || !this.listeners[eventName]) {
      throw new Error(`No listeners found for event: '${eventName}' to unsubscribe.`);
    }
    const sliceListeners = this.listeners[eventName][sliceName];
    if (!sliceListeners || !sliceListeners.delete(callback)) {
      console.warn(`Cannot unsubscribe to a non-existent listener '${eventName}'.`);
    }
  }

  /**
   * Retrieves the current state data of a specific event slice.
   * @param {string} eventName - The name of the event.
   * @param {string} sliceName - The name of the slice within the event.
   * @returns {T | undefined} - The current state data of the event slice, or undefined if not found.
   */
  getState(eventName: string, sliceName: string): T | undefined {
    return this.notifierState[eventName]?.[sliceName];
  }
}

export default ChangeNotifier;
