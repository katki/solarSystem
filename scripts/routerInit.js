import Router from "./paramHashRouter.js";
import Routes from "./routes.js";

let url = window.location.href.split("#");

switch (url[1]) {
    case 'commentSection': window.router = new Router(Routes, "commentSection"); break;
    case 'articles': window.router = new Router(Routes, "articles"); break;
    default: window.router = new Router(Routes, "welcome"); break;
}

