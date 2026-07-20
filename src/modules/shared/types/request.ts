// Estado de una operación asíncrona (thunk) reutilizable por todos los slices.
// Coincide con los estados de los createAsyncThunk (pending/fulfilled/rejected)
// más el estado inicial "idle".
export type RequestStatus = "idle" | "pending" | "fulfilled" | "rejected";
