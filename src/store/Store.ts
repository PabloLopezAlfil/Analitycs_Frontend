import { configureStore } from "@reduxjs/toolkit"



    const Store = configureStore({
    reducer: {
    }
    });



    export type AppStore = typeof Store
    export type RootState = ReturnType<AppStore['getState']>
    export type AppDispatch = typeof Store.dispatch;

    export default Store;