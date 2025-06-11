import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../clases/User';
import { RegisterComponent } from '../register/register.component';

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule,RegisterComponent,],
  standalone:true,
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  registroAbierto = false;
  usuarios = signal<User[]>([]);
  constructor(private dbService: DatabaseService)
  {
        this.dbService.registroOpen$.subscribe(abierto=>{
      this.registroAbierto = abierto;
    })
  }

  ngOnInit(): void {
    this.traerUsers();
  }

  mostrarRegistro()
  {
    this.dbService.abrirRegistro();
  }

  async traerUsers()
  {
    const {data,error} = await this.dbService.traerUsuarios();
    
    if(data)
      {
      const listaUsuarios: User[] = [];
      for(let usuario of data)
      {
        const user = new User(usuario.id_user, usuario.id, usuario.name, usuario.sur_name, usuario.age, usuario.dni, usuario.rol, usuario.foto_perfil);
        if(usuario.rol === "especialista")
        {
          user.estado = await this.consultarEstadoEspecialista(usuario.id);
          console.log("Estado del especialista:", user.estado);
        }
        listaUsuarios.push(user);
      }

      this.usuarios.set(listaUsuarios);
      
    }
  }

  async consultarEstadoEspecialista(id:string)
  {
    let estado = "";
    const {data,error }=  await this.dbService.obtenerEstadoEspecialista(id)
    if(!error)
    {
      estado = data?.estado
    }

    return estado;
  }

  async actualizarEstadoEspecialista(user:User,estado:boolean)
  {
    const {error,estadoUsuario} = await this.dbService.actualizarEstadoEspecialista(user.id,estado);
    if(!error)
    {
      user.estado = estadoUsuario;

    }
  }
}
