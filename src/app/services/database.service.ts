import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private supabaseService:SupabaseService) { 

  }

  async insertSignUp(id:string|undefined,name:string,sur_name:string,age:number,mail:string,dni:number)
  {
    const {error} = await this.supabaseService.supabase
    .from('users')
    .insert([
      { id: id, name: name, sur_name: sur_name,age:age,mail:mail,dni:dni}
    ]);

    return {error};
  }

  async insertSignUpPaciente(table:string,obraS:string,id:string,pathFoto1:string,pathFoto2:string)
  {
    await this.supabaseService.supabase
    .from(table)
    .insert([
      { id: id,obra_social:obraS,foto_perfil:pathFoto1,foto_fondo:pathFoto2}
    ]);
  }

  async insertSignUpEspecialista(table:string,id:string,pathFoto:string,especialidades:string[])
  {
    await this.supabaseService.supabase
    .from(table)
    .insert([
      { id: id,foto_perfil:pathFoto}
    ]);

    this.insertEspecialidad(especialidades,id,table)
  }

    async insertSignUpAdmin(table:string,id:string,pathFoto:string)
  {
    await this.supabaseService.supabase
    .from(table)
    .insert([
      { id: id,foto_perfil:pathFoto}
    ]);

  }


  

  async insertEspecialidad(especialidades: string[], id: string, table: string) {
    for (let i = 0; i < especialidades.length; i++) {
      const campo = `especialidades_${i+1}`;
      const valor = especialidades[i];

      const { error } = await this.supabaseService.supabase
        .from(table)
        .update({[campo]:valor})
        .eq('id',id);

      if (error) {
        console.error(`Error`);
      }
    }
}


  async insertPhoto(path:string,id:string,file:File,bucket:string,table:string)
  {
    const {error:errorStorage} = await this.supabaseService.supabase.storage.from
    (bucket)
    .upload(path,file)
  if (!errorStorage) {

    const publicUrl = this.supabaseService.supabase
      .storage
      .from(bucket)
      .getPublicUrl(path).data.publicUrl;

    const { error } = await this.supabaseService.supabase
      .from(table)
      .insert({
        id: id,
        foto_perfil: publicUrl,
      });
  }
  }

  
}
