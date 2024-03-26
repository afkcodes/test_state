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
 * @returns {value is object} - True if the value is a valid object, otherwise false.
 */
export const checkValidObject = (value: any): value is object =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  value.constructor === Object;

/**
 * Checks whether the provided value is a valid function.
 * @param {*} value - The value to be checked.
 * @returns {boolean} - True if the value is a valid function, otherwise false.
 */
export const checkValidFunction = (value: any): boolean => typeof value === 'function';

/**
 * Represents a ChangeNotifier that facilitates event notification and subscription.
 * @template T - The type of data associated with the event.
 */
class ChangeNotifier<T> {
  private static instance: ChangeNotifier<any>;
  private listeners: Record<string, Set<ListenerCallback<T>>> = {};
  private notifierState: Record<string, T> = {};

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
   * Notifies all subscribed callbacks of a specific event with provided data.
   * @param {string} eventName - The name of the event.
   * @param {T} data - The data associated with the event.
   * @param {string} caller - The identifier of the caller.
   * @throws Will throw an error if the event name is invalid.
   * @returns {void}
   */
  notify(eventName: string, data: T, caller: string = 'notifier_default'): void {
    if (!this.validateEvent(eventName)) {
      throw new Error(`Invalid event name: '${eventName}'`);
    }

    if (!this.listeners[eventName]) {
      console.warn(`No listeners for event: '${eventName}' called by '${caller}'.`);
      return;
    }

    const callbacks = this.listeners[eventName];

    const stateData = checkValidObject(data)
      ? { ...(this.notifierState[eventName] || {}), ...data }
      : data;
    this.notifierState[eventName] = stateData;

    callbacks.forEach((cb) => cb(stateData));

    console.log(`Notify called for '${eventName}' by '${caller}', data:`, data);
  }

  /**
   * Subscribes a callback function to a specific event.
   * @param {string} eventName - The name of the event.
   * @param {ListenerCallback<T>} callback - The callback function to be invoked on event notification.
   * @param {T} initialState - The initial state associated with the event.
   * @throws Will throw an error if the event name or callback function is invalid.
   * @returns {void}
   */
  listen(
    eventName: string,
    callback: ListenerCallback<T>,
    initialState: T = {} as T
  ): void {
    if (!this.validateEvent(eventName) || !checkValidFunction(callback)) {
      throw new Error(`Invalid parameters for event: '${eventName}'`);
    }

    if (!this.listeners[eventName]) {
      this.listeners[eventName] = new Set<ListenerCallback<T>>();
      this.notifierState[eventName] = initialState;
    }

    // Add listener for the event

    this.listeners[eventName].add(callback);

    // Check if there is existing state data and notify the listener immediately if present
    if (
      this.notifierState[eventName] !== null ||
      (checkValidObject(this.notifierState[eventName]) &&
        Object.keys(this.notifierState[eventName] as any))
    ) {
      this.notify(eventName, this.notifierState[eventName]);
    }
  }

  /**
   * Unsubscribes a callback function from a specific event.
   * @param {string} eventName - The name of the event.
   * @param {ListenerCallback<T>} callback - The callback function to be unsubscribed.
   * @throws Will throw an error if no listeners are found for the specified event.
   * @returns {void}
   */
  unsubscribe(eventName: string, callback: ListenerCallback<T>): void {
    if (!this.validateEvent(eventName) || !this.listeners[eventName]) {
      throw new Error(`No listeners found for event: '${eventName}' to unsubscribe.`);
    }
    if (!this.listeners[eventName].delete(callback)) {
      console.warn(`Cannot unsubscribe to a non-existent listener '${eventName}'.`);
    }
  }
}

export default ChangeNotifier;
