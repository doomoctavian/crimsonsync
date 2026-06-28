/**
 * Generic async data hook — React-ready pattern for vanilla JS pages.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi(() => fetchRequests(role));
 */
export function useApi(fetcher, { immediate = true } = {}) {
    const state = { data: null, loading: false, error: null };

    const listeners = new Set();
    const notify = () => listeners.forEach((cb) => cb({ ...state }));

    async function execute() {
        state.loading = true;
        state.error = null;
        notify();

        try {
            state.data = await fetcher();
        } catch (err) {
            state.error = err;
            state.data = null;
        } finally {
            state.loading = false;
            notify();
        }

        return state;
    }

    if (immediate) execute();

    return {
        get data() { return state.data; },
        get loading() { return state.loading; },
        get error() { return state.error; },
        refetch: execute,
        subscribe(callback) {
            listeners.add(callback);
            callback({ ...state });
            return () => listeners.delete(callback);
        },
    };
}

/**
 * Mutation hook for form submissions and actions.
 */
export function useMutation(mutationFn) {
    const state = { data: null, loading: false, error: null };
    const listeners = new Set();
    const notify = () => listeners.forEach((cb) => cb({ ...state }));

    async function mutate(payload) {
        state.loading = true;
        state.error = null;
        notify();

        try {
            state.data = await mutationFn(payload);
            return state.data;
        } catch (err) {
            state.error = err;
            throw err;
        } finally {
            state.loading = false;
            notify();
        }
    }

    return {
        get data() { return state.data; },
        get loading() { return state.loading; },
        get error() { return state.error; },
        mutate,
        subscribe(callback) {
            listeners.add(callback);
            return () => listeners.delete(callback);
        },
    };
}
