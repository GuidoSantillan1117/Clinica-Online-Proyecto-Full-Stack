import { Routes } from '@angular/router';

export const routes: Routes = [
{
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    title:"Inicio",
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
    {
    title:"Registrarse",
    path: 'register',
    loadComponent: () =>
    import('./pages/register/register.component').then((m) => m.RegisterComponent),
    },
    {
    title:"Usuarios",
    path: 'users',
    loadComponent: () =>
    import('./pages/users/users.component').then((m) => m.UsersComponent),
    }
];
