// src/lib/hooks.ts

type HookCallback = (...args: any[]) => any;

interface RegisteredCallback {
  callback: HookCallback;
  priority: number;
  acceptedArgs: number;
  id: symbol;
}

class HookServer {
  private actions = new Map<string, RegisteredCallback[]>();
  private filters = new Map<string, RegisteredCallback[]>();
  private didActions = new Map<string, number>();
  private currentFilter: string | null = null;

  // Register an action callback
  add_action(
    name: string,
    callback: HookCallback,
    priority = 10,
    acceptedArgs = 1
  ): symbol {
    const id = Symbol(name);
    const entry: RegisteredCallback = { callback, priority, acceptedArgs, id };
    const existing = this.actions.get(name) ?? [];
    existing.push(entry);
    existing.sort((a, b) => a.priority - b.priority);
    this.actions.set(name, existing);
    return id;
  }

  // Register a filter callback
  add_filter(
    name: string,
    callback: HookCallback,
    priority = 10,
    acceptedArgs = 1
  ): symbol {
    const id = Symbol(name);
    const entry: RegisteredCallback = { callback, priority, acceptedArgs, id };
    const existing = this.filters.get(name) ?? [];
    existing.push(entry);
    existing.sort((a, b) => a.priority - b.priority);
    this.filters.set(name, existing);
    return id;
  }

  // Fire all action callbacks for a hook
  async do_action(name: string, ...args: any[]): Promise<void> {
    const callbacks = this.actions.get(name) ?? [];
    this.didActions.set(name, (this.didActions.get(name) ?? 0) + 1);
    const prevFilter = this.currentFilter;
    this.currentFilter = name;
    for (const { callback, acceptedArgs } of callbacks) {
      await callback(...args.slice(0, acceptedArgs));
    }
    this.currentFilter = prevFilter;
  }

  // Apply all filter callbacks, threading the value through
  async apply_filters(name: string, value: any, ...args: any[]): Promise<any> {
    const callbacks = this.filters.get(name) ?? [];
    const prevFilter = this.currentFilter;
    this.currentFilter = name;
    let result = value;
    for (const { callback, acceptedArgs } of callbacks) {
      // Pass the current result and slice args to match the rest of acceptedArgs
      result = await callback(result, ...args.slice(0, acceptedArgs - 1));
    }
    this.currentFilter = prevFilter;
    return result;
  }

  // Remove a specific action by its returned symbol ID
  remove_action(name: string, id: symbol): boolean {
    const callbacks = this.actions.get(name);
    if (!callbacks) return false;
    const idx = callbacks.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    callbacks.splice(idx, 1);
    return true;
  }

  // Remove a specific filter by its returned symbol ID
  remove_filter(name: string, id: symbol): boolean {
    const callbacks = this.filters.get(name);
    if (!callbacks) return false;
    const idx = callbacks.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    callbacks.splice(idx, 1);
    return true;
  }

  // Check if a hook has any callbacks
  has_action(name: string): boolean {
    return (this.actions.get(name)?.length ?? 0) > 0;
  }

  has_filter(name: string): boolean {
    return (this.filters.get(name)?.length ?? 0) > 0;
  }

  // How many times has an action fired?
  did_action(name: string): number {
    return this.didActions.get(name) ?? 0;
  }

  // What hook is currently executing?
  current_filter(): string | null {
    return this.currentFilter;
  }
}

// Singleton export — import this everywhere
export const hooks = new HookServer();
export default hooks;
