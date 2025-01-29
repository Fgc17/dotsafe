export type Promisable<T> = T | Promise<T>;

export interface GenericClass<T> extends Function {
  new (...args: any[]): T;
}
