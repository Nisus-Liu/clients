import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import "bootstrap";
import "jquery";
import "popper.js";

require("./scss/styles.scss");
require("./scss/tailwind.css");

import Log from "@bitwarden/common/tools/log";

import { AppModule } from "./app/app.module";

if (process.env.NODE_ENV === "production") {
  enableProdMode();
}

Log.debug("=> Main");

platformBrowserDynamic().bootstrapModule(AppModule, { preserveWhitespaces: true });
