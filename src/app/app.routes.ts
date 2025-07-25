import { Routes } from '@angular/router';
import { MiPerfilComponent } from './pages/mi-perfil/mi-perfil.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    title: "Inicio",
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    title: "Registrarse",
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    title: "Usuarios",
    path: 'users',
    loadComponent: () =>
      import('./pages/users/users.component').then((m) => m.UsersComponent),
  },
  {
    title: "Bienvenido",
    path: 'bienvenida',
    loadComponent: () =>
      import('./pages/bienvenida/bienvenida.component').then((m) => m.BienvenidaComponent),
      data:{animation: 'BienvenidaPage'}
  }
,
    {
    title: "Mis turnos",
    path: 'mis-turnos',
    loadComponent: () =>
      import('./pages/mis-turnos/mis-turnos.component').then((m) => m.MisTurnosComponent),
  },
      {
    title: "Turnos del sistema",
    path: 'turnos',
    loadComponent: () =>
      import('./pages/turnos/turnos.component').then((m) => m.TurnosComponent),
  },
  {
    title: "Mis turnos",
    path: 'mis-turnos',
    loadComponent: () =>
      import('./pages/mis-turnos/mis-turnos.component').then((m) => m.MisTurnosComponent),
  },
    {
    title: "Mi perfil",
    path: 'mi-perfil',
    loadComponent: () =>
      import('./pages/mi-perfil/mi-perfil.component').then((m) => m.MiPerfilComponent),
      data:{animation: 'MiPerfilPage'}
  },
    {
    title: "Solicitar turno",
    path: 'solicitar-turno',
    loadComponent: () =>
      import('./pages/solicitar-turno/solicitar-turno.component').then((m) => m.SolicitarTurnoComponent),
  },
      {
    title: "Historial",
    path: 'pacientes',
    loadComponent: () =>
      import('./pages/pacientes/pacientes.component').then((m) => m.PacientesComponent)
  }
,
  {
    title: "Estadisticas",
    path: 'estadisticas',
    loadComponent: () =>
      import('./pages/estadisticas/estadisticas.component').then((m) => m.EstadisticasComponent)
  }



];
