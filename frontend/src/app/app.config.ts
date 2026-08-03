import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from "@angular/core";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import {
  provideRouter,
  withComponentInputBinding,
  withPreloading,
  PreloadAllModules,
} from "@angular/router";
import { rotas } from "./app.routes";
import { interceptorAutenticacao } from "./core/authentication/authentication.interceptor";
import { MAT_DATE_LOCALE } from "@angular/material/core";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAnimations(),
    provideHttpClient(withInterceptors([interceptorAutenticacao])),
    provideRouter(
      rotas,
      withComponentInputBinding(),
      withPreloading(PreloadAllModules),
    ),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }
  ],
};
