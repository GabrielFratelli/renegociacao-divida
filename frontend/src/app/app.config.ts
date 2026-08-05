import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from "@angular/core";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { MAT_DATE_LOCALE } from "@angular/material/core";
import { provideRouter } from "@angular/router";
import { rotas } from "./app.routes";
import { interceptorAutenticacao } from "./core/authentication/authentication.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptors([interceptorAutenticacao])),
    provideRouter(rotas),
    { provide: MAT_DATE_LOCALE, useValue: "pt-BR" },
  ],
};
