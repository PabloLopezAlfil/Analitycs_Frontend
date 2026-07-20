import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "../src/store/Store";
import "./index.css";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MenuSide from "./modules/shared/Layaout/MenuSide";
import Home from "./modules/Home";




createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route element={<MenuSide />}>
            <Route path='/' element={<Home/>}/>
           </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
