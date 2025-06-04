export class User{
    id_user:number;
    id: string;
    nombre: string;
    apellido: string;
    edad: number;
    dni:number;
    rol:string;
    foto_perfil: string;
    estado : string;
    
    constructor(id_user:number,id: string, name: string, sur_name: string, age: number, dni:number,rol:string,foto_perfil:string) {
        this.id_user = id_user;
        this.id = id;
        this.nombre = name;
        this.apellido = sur_name;
        this.edad = age;
        this.dni = dni;
        this.rol = rol;
        this.foto_perfil = foto_perfil;
        this.estado = "---"; 

    }
}